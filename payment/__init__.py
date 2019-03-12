"""
Payment for subscriptions using stripe
"""
from django.apps import AppConfig

default_app_config = "payment.PaymentAppConfig"


class PaymentAppConfig(AppConfig):
	"""
	An AppConfig which loads event handlers once Django is ready.
	"""

	name = "payment"

	def ready(self):
		from . import event_handlers  # noqa: Register the event handlers
