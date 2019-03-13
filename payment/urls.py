from django.conf.urls import url

from base.views import app

from . import views

urlpatterns = [
    url('^$', app, name='index'),
    url(
        '^get_stripe_details/$',
        views.get_stripe_details_js,
        name='get_stripe_details'
    ),
    url(
        '^cancel_subscription/$',
        views.cancel_subscription_js,
        name='cancel_subscription'
    ),
    url(
        '^reactivate_subscription/$',
        views.cancel_subscription_js,
        name='reactivate_subscription'
    )
]
