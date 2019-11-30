# fiduswriter-payment


Installation
-----

1. clone this repository and link the payment folder in the fiduswriter main folder
2. Under "INSTALLED_APPS" in configuration.py, add "payment"
3. Sign up with Paddle.com, create plans and register a webhook (the URL is https:YOURWEBSITE.COM/api/payment/webhook/).
4. Add settings in configuration.py:

    > PADDLE_VENDOR_ID = ""

    > PADDLE_MONTHLY_PLAN_ID = ""

    > PADDLE_SIX_MONTHS_PLAN_ID = ""

    > PADDLE_ANNUAL_PLAN_ID = ""

5. Run:

    > python manage.py migrate
