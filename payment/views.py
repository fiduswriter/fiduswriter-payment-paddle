from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from djstripe.models import Customer


@login_required
def get_stripe_details_js(request):
    if not request.is_ajax() or request.method != 'POST':
        return JsonResponse(
            {},
            status=403
        )
    response = {}
    response['user_id'] = request.user.id
    subscribed = False
    customer = Customer.objects.filter(subscriber=request.user).first()
    if customer:
        if customer.has_any_active_subscription():
            subscribed = True
        else:
            # The customer's subscription has run out, so we just delete the
            # customer. That way a new customer can be created for the user if
            # needed.
            customer.delete()
    response['subscribed'] = subscribed
    if settings.STRIPE_LIVE_MODE:
        response['public_key'] = settings.STRIPE_LIVE_PUBLIC_KEY
        response['monthly_plan_id'] = settings.STRIPE_LIVE_MONTHLY_PLAN_ID
    else:
        response['public_key'] = settings.STRIPE_TEST_PUBLIC_KEY
        response['monthly_plan_id'] = settings.STRIPE_TEST_MONTHLY_PLAN_ID
    return JsonResponse(response, status=200)

@login_required
def cancel_subscription_js(request):
    if not request.is_ajax() or request.method != 'POST':
        return JsonResponse(
            {},
            status=403
        )
    customer = Customer.objects.filter(subscriber=request.user).first()
    if customer:
        customer.delete()
    return JsonResponse({}, status=204)
