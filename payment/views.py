import datetime

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt

from .models import Customer
from .validate import validate_webhook_request


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
    customer = Customer.objects.filter(user=request.user).first()
    if customer:
        if (
            not customer.cancelation_date or
            customer.cancelation_date < datetime.date.today()
        ):
            response['subscribed'] = customer.subscription_type
            response['cancel_url'] = customer.cancel_url
            response['update_url'] = customer.update_url
            if customer.cancelation_date < datetime.date.today():
                response['subscription_end'] = customer.cancelation_date
        else:
            response['subscribed'] = False
            customer.delete()
    else:
        response['subscribed'] = False
    return JsonResponse(response, status=200)


@csrf_exempt
def webhook(request):
    status = 200
    if (
        request.method != 'POST' or
        not validate_webhook_request(request.POST)
    ):
        status = 403
        return JsonResponse(
            {},
            status=status
        )
    alert_name = request.POST['alert_name']
    if not alert_name in [
        'subscription_created',
        'subscription_updated',
        'subscription_cancelled'
    ]:
        return JsonResponse(
            {},
            status=status
        )
    user_id = int(request.POST['passthrough'])
    user = User.objects.filter(id=user_id).first()
    if not user:
        return JsonResponse(
            {},
            status=status
        )
    if alert_name == 'subscription_created':
        customer = Customer(
            user=user,
            subscription_id=request.POST['subscription_id']
        )
    else:
        customer = Customer.objects.filter(
            user=user,
            subscription_id=request.POST['subscription_id']
        ).first()
        if not customer:
            status = 403
            return JsonResponse(
                {},
                status=status
            )
    customer.status = request.POST['status']
    customer.unit_price = request.POST['unit_price']
    customer.currency = request.POST['currency']
    customer.subscription_plan_id = request.POST['subscription_plan_id']
    if alert_name == 'subscription_cancelled':
        customer.cancelation_date = request.POST['cancellation_effective_date']
    else:
        customer.cancel_url = request.POST['cancel_url']
        customer.update_url = request.POST['update_url']
    if customer.subscription_plan_id == settings.PADDLE_ANNUAL_PLAN_ID:
        customer.subscription_type = 'annual'
    elif (
        customer.subscription_plan_id ==
        settings.PADDLE_SIX_MONTHS_PLAN_ID
    ):
        customer.subscription_type = 'sixmonths'
    else:
        customer.subscription_type = 'monthly'
    customer.save()

    return JsonResponse(
        {},
        status=status
    )



# @login_required
# def cancel_subscription(request):
#     status = 200
#     if not request.is_ajax() or request.method != 'POST':
#         status = 403
#         return JsonResponse(
#             {},
#             status=status
#         )
#     customer = Customer.objects.filter(subscriber=request.user).first()
#     if customer and customer.subscription:
#         customer.subscription.cancel()
#         status = 204
#     return JsonResponse({}, status=status)


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
