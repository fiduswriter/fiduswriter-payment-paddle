from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse


@login_required
def get_stripe_details_js(request):
    if not request.is_ajax() or request.method != 'POST':
        return JsonResponse(
            {},
            status=403
        )
    response = {}
    if settings.STRIPE_LIVE_MODE:
        response['public_key'] = settings.STRIPE_LIVE_PUBLIC_KEY
        response['monthly_plan_id'] = settings.STRIPE_LIVE_MONTHLY_PLAN_ID
    else:
        response['public_key'] = settings.STRIPE_TEST_PUBLIC_KEY
        response['monthly_plan_id'] = settings.STRIPE_TEST_MONTHLY_PLAN_ID
    return JsonResponse(response, status=200)
