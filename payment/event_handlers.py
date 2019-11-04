import datetime

from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save

from document.models import Document

from djstripe.models import Subscription, Customer
from djstripe import webhooks


@webhooks.handler("checkout.session.completed")
def session_succeeded(event):
    """Handle the session succeeded event to hook a newly created customer to
    a django user."""
    session_data = event.data.get("object", {})
    user_id = session_data.get("client_reference_id", None)
    subscription_id = session_data.get("subscription", None)

    if subscription_id and user_id:
        subscription = Subscription.objects.filter(id=subscription_id).first()
        user = User.objects.filter(id=user_id).first()
        if (
            user and
            subscription and
            subscription.customer and
            not subscription.customer.subscriber
        ):
            customer = subscription.customer
            customer.subscriber_id = user_id
            customer.metadata = {} or customer.metadata
            customer.metadata['djstripe_subscriber'] = user_id
            customer.metadata['updated'] = datetime.datetime.now()
            customer.save()


@receiver(post_save, sender=Document)
def handler_save_document(sender, instance, created, **kwargs):
    if created:
        forbidden = True
        if instance.owner.is_staff:
            forbidden = False
        elif instance.owner.owner.count() < 5:
            forbidden = False
        else:
            customer = Customer.objects.filter(
                subscriber=instance.owner
            ).first()
            if customer and customer.has_any_active_subscription():
                forbidden = False
        if forbidden:
            instance.delete()
