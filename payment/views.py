import datetime

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from .models import Customer


def get_paddle_info(request):
    if not request.is_ajax() or request.method != 'POST':
        return JsonResponse(
            {},
            status=403
        )
    response = {}
    response['vendor_id'] = settings.PADDLE_VENDOR_ID
    response['monthly_plan_id'] = settings.PADDLE_MONTHLY_PLAN_ID
    response['six_months_plan_id'] = settings.PADDLE_SIX_MONTHS_PLAN_ID
    response['annual_plan_id'] = settings.PADDLE_ANNUAL_PLAN_ID
    return JsonResponse(response, status=200)


@login_required
def get_subscription_details(request):
    if not request.is_ajax() or request.method != 'POST':
        return JsonResponse(
            {},
            status=403
        )
    response = {}
    response['staff'] = request.user.is_staff
    subscribed = False
    customer = Customer.objects.filter(user=request.user).first()
    if customer:
        if not customer.cancelation_date:
            subscribed = customer.subscription_type
        elif customer.cancelation_date < datetime.date.today():
            response['subscription_end'] = customer.cancelation_date
            subscribed = customer.subscription_type
        else:
            customer.delete()
    response['subscribed'] = subscribed
    return JsonResponse(response, status=200)


def webhook(request):
    status = 200
    if not request.is_ajax() or request.method != 'POST':
        status = 403
        return JsonResponse(
            {},
            status=status
        )


@login_required
def cancel_subscription(request):
    status = 200
    if not request.is_ajax() or request.method != 'POST':
        status = 403
        return JsonResponse(
            {},
            status=status
        )
    customer = Customer.objects.filter(subscriber=request.user).first()
    if customer and customer.subscription:
        customer.subscription.cancel()
        status = 204
    return JsonResponse({}, status=status)


@login_required
def reactivate_subscription(request):
    status = 200
    if not request.is_ajax() or request.method != 'POST':
        status = 403
        return JsonResponse(
            {},
            status=status
        )
    customer = Customer.objects.filter(subscriber=request.user).first()
    if customer and customer.subscription:
        customer.subscription.reactivate()
    return JsonResponse({}, status=status)
