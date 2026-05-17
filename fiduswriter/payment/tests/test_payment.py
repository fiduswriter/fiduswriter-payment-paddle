import time
import json
import multiprocessing
from http.server import BaseHTTPRequestHandler, HTTPServer
import socket
from urllib.parse import urljoin

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from channels.testing import ChannelsLiveServerTestCase
from testing.selenium_helper import SeleniumHelper

from django.conf import settings
from django.test import override_settings

from payment import models, views


class MockPaddleHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_POST(self):
        with open("/tmp/payment_debug.log", "a") as f:
            f.write(f"mock server received POST {self.path}\n")
        if self.path == "/api/2.0/subscription/users/update":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            self.server.shared_state["last_request_body"] = body
            with open("/tmp/payment_debug.log", "a") as f:
                f.write(f"mock server body: {body}\n")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({"success": True}).encode(encoding="utf_8")
            )
            return
        self.send_response(404)
        self.end_headers()


def get_free_port():
    s = socket.socket(socket.AF_INET, type=socket.SOCK_STREAM)
    s.bind(("localhost", 0))
    address, port = s.getsockname()
    s.close()
    return port


@override_settings(
    PADDLE_VENDOR_ID=12345,
    PADDLE_MONTHLY_PLAN_ID=11111,
    PADDLE_SIX_MONTHS_PLAN_ID=22222,
    PADDLE_ANNUAL_PLAN_ID=33333,
    PADDLE_API_KEY="test-api-key",
    PADDLE_PUBLIC_KEY=(
        "-----BEGIN PUBLIC KEY-----\n"
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtest\n"
        "-----END PUBLIC KEY-----"
    ),
)
class PaymentDummyTest(SeleniumHelper, ChannelsLiveServerTestCase):
    fixtures = ["initial_documenttemplates.json", "initial_styles.json"]

    @classmethod
    def start_server(cls, port, shared_state):
        httpd = HTTPServer(("", port), MockPaddleHandler)
        httpd.shared_state = shared_state
        httpd.serve_forever()

    @classmethod
    def setUpClass(cls):
        # Start the mock Paddle server and set PADDLE_API_URL BEFORE
        # super().setUpClass() so the forked Daphne process inherits it.
        cls.server_port = get_free_port()
        cls.manager = multiprocessing.Manager()
        cls.shared_state = cls.manager.dict()
        cls.shared_state["last_request_body"] = None
        cls.server = multiprocessing.Process(
            target=cls.start_server,
            args=(cls.server_port, cls.shared_state),
        )
        cls.server.daemon = True
        cls.server.start()
        settings.PADDLE_API_URL = (
            f"http://localhost:{cls.server_port}"
            "/api/2.0/subscription/users/update"
        )
        super().setUpClass()
        cls.base_url = cls.live_server_url
        driver_data = cls.get_drivers(1)
        cls.driver = driver_data["drivers"][0]
        cls.client = driver_data["clients"][0]
        cls.driver.implicitly_wait(driver_data["wait_time"])
        cls.wait_time = driver_data["wait_time"]
        # Inject mock Paddle before any page script runs so the frontend
        # skips loading the real paddle.js from the CDN.
        cls.driver.execute_cdp_cmd(
            "Page.addScriptToEvaluateOnNewDocument",
            {
                "source": """
                    window.Paddle = {
                        Environment: { set: function() {} },
                        Setup: function() {},
                        Product: {
                            Prices: function(planId, callback) {
                                callback({
                                    recurring: {
                                        price: { gross: '$9.99' },
                                        subscription: { trial_days: 0 }
                                    }
                                });
                            }
                        },
                        Checkout: {
                            open: function(opts) {
                                if (opts.successCallback) {
                                    opts.successCallback();
                                }
                            }
                        }
                    };
                """
            },
        )

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        cls.server.terminate()
        cls.manager.shutdown()
        super().tearDownClass()

    def setUp(self):
        self.user = self.create_user(
            username="User1", email="user1@user.com", passtext="password"
        )
        self.original_validate = views.validate_webhook_request
        views.validate_webhook_request = lambda request: True

    def tearDown(self):
        views.validate_webhook_request = self.original_validate
        super().tearDown()

    def create_document(self, title="Test"):
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CLASS_NAME, "editor-toolbar"))
        )
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").click()
        self.driver.find_element(By.CSS_SELECTOR, ".doc-title").send_keys(
            title
        )
        time.sleep(1)
        self.driver.find_element(By.ID, "close-document-top").click()

    def test_payment_dummy(self):
        self.login_user(self.user, self.driver, self.client)
        self.driver.get(urljoin(self.base_url, "/"))

        # Create two documents
        self.create_document("Doc 1")
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        )
        self.create_document("Doc 2")

        time.sleep(1)
        # Try to create a third document - should be blocked
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, ".new_document button")
            )
        ).click()
        time.sleep(1)

        # Check that subscription warning dialog appears
        dialog_title = self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog-title"
        ).text
        self.assertEqual(dialog_title, "Subscription warning")

        # Click "Go to subscription page"
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Go to subscription page"]'
        ).click()
        time.sleep(2)

        # Verify we're on the payment page
        self.assertIn("/payment/", self.driver.current_url)

        # Verify the payment page shows pricing options
        self.driver.find_element(By.CSS_SELECTOR, ".subscription.monthly")
        self.driver.find_element(By.CSS_SELECTOR, ".subscription.sixmonths")
        self.driver.find_element(By.CSS_SELECTOR, ".subscription.annual")

        # Simulate webhook creating a subscription
        response = self.client.post(
            "/api/payment/webhook/",
            {
                "alert_name": "subscription_created",
                "passthrough": str(self.user.id),
                "subscription_id": "123456",
                "subscription_plan_id": "11111",
                "status": "active",
                "unit_price": "9.99",
                "currency": "USD",
                "cancel_url": "http://cancel.url",
                "update_url": "http://update.url",
                "p_signature": "dummy",
            },
        )
        self.assertEqual(response.status_code, 200)

        # Verify subscription was created
        customer = models.Customer.objects.filter(user=self.user).first()
        self.assertIsNotNone(customer)
        self.assertEqual(customer.subscription_type, "monthly")
        self.assertEqual(customer.status, "active")

        # Go back to documents overview and create third document
        self.driver.get(urljoin(self.base_url, "/"))
        time.sleep(1)

        self.create_document("Doc 3")

        # Verify three documents exist
        self.driver.get(urljoin(self.base_url, "/"))
        time.sleep(1)
        rows = self.driver.find_elements(
            By.CSS_SELECTOR, "table.fw-data-table tbody tr"
        )
        self.assertEqual(len(rows), 3)

        # Go to payment page and verify subscription is shown
        self.driver.get(urljoin(self.base_url, "/payment/"))
        time.sleep(2)

        # The monthly button should show "Modify" instead of "Sign up"
        monthly_btn = self.driver.find_element(
            By.CSS_SELECTOR, ".subscription.monthly"
        )
        self.assertIn("MODIFY", monthly_btn.text)

        # Test switching subscription plan
        annual_btn = self.driver.find_element(
            By.CSS_SELECTOR, ".subscription.annual"
        )
        annual_btn.click()
        time.sleep(1)

        # Dialog should ask to switch
        dialog_title = self.driver.find_element(
            By.CSS_SELECTOR, ".ui-dialog-title"
        ).text
        self.assertEqual(dialog_title, "Switch subscription")

        # Click "Yes"
        self.driver.find_element(
            By.XPATH, '//*[normalize-space()="Yes"]'
        ).click()
        time.sleep(5)

        # Verify the mock server received the update request
        last_body = self.shared_state.get("last_request_body")
        self.assertIsNotNone(last_body)
        self.assertIn("plan_id=33333", last_body)
