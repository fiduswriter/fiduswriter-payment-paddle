import datetime

from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save

from document.models import Document

from .models import Customer

PADDLE_SETTINGS = [
    "PADDLE_VENDOR_ID",
    "PADDLE_MONTHLY_PLAN_ID",
    "PADDLE_SIX_MONTHS_PLAN_ID",
    "PADDLE_ANNUAL_PLAN_ID",
]


@receiver(post_save, sender=Document)
def handler_save_document(sender, instance, created, **kwargs):
    if created and all(
        hasattr(settings, setting) for setting in PADDLE_SETTINGS
    ):
        # Only enforce the free-tier document limit when the Paddle payment
        # integration is actually configured.
        forbidden = True
        if instance.owner.is_staff:
            forbidden = False
        elif instance.owner.owner.count() < 3:
            forbidden = False
        else:
            customer = Customer.objects.filter(user=instance.owner).first()
            if not customer:
                pass
            elif customer.cancelation_date:
                if customer.cancelation_date > datetime.date.today():
                    forbidden = False
                else:
                    customer.delete()
            else:
                forbidden = False
        if forbidden:
            instance.delete()
