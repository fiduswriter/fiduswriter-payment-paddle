"""
Payment for subscriptions using stripe
"""
from django.apps import AppConfig

default_app_config = "payment.PaymentAppConfig"


class PaymentAppConfig(AppConfig):
    name = "payment"

    def ready(self):
        from . import event_handlers
