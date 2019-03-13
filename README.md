# fiduswriter-payment


Installation
-----

1. pip install dj-stripe
2. clone this repository and link the payment folder in the fiduswriter main folder
3. Under "INSTALLED_APPS" in configuration.py, add "djstripe" and "payment"
4. Sign up with Stripe.com, create a plan and register a webhook (the URL is https:YOURWEBSITE.COM/djstripe/webhook/).
5. Add settings in configuration.py:


    > STRIPE_LIVE_MODE = False  # Change to True in production
    
    > STRIPE_LIVE_PUBLIC_KEY = ""
    
    > STRIPE_LIVE_SECRET_KEY = ""
    
    > STRIPE_TEST_PUBLIC_KEY = ""
    
    > STRIPE_TEST_SECRET_KEY = ""
    
    > DJSTRIPE_WEBHOOK_SECRET = ""
    
    > STRIPE_TEST_MONTHLY_PLAN_ID = ""
    
    > STRIPE_LIVE_MONTHLY_PLAN_ID = ""

6. Run:
    python manage.py migrate
    python manage.py djstripe_sync_plans_from_stripe
    
DO NOT RUN python manage.py djstripe_init_customers!!!
