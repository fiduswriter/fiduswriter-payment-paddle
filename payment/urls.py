from django.conf.urls import url

from . import views

urlpatterns = [
    url(
        '^get_stripe_details/$',
        views.get_stripe_details,
        name='get_stripe_details'
    ),
    url(
        '^cancel_subscription/$',
        views.cancel_subscription,
        name='cancel_subscription'
    ),
    url(
        '^reactivate_subscription/$',
        views.reactivate_subscription,
        name='reactivate_subscription'
    )
]
