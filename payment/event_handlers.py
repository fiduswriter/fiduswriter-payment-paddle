import datetime

from django.contrib.auth.models import User

from djstripe.models import Subscription
from djstripe import webhooks


@webhooks.handler("checkout_beta.session_succeeded")
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
