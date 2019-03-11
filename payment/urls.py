from django.conf.urls import url

from base.views import app

urlpatterns = [
    url('^$', app, name='index'),
]
