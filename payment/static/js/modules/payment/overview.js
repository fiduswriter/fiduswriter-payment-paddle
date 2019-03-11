import {advertisementTemplate} from "./templates"
import {whenReady, baseBodyTemplate, setDocTitle, ensureCSS, postJson} from "../common"
import {SiteMenu} from "../menu"
import {FeedbackTab} from "../feedback"

export class PaymentOverview {
    constructor({app, user, staticUrl}) {
        this.app = app
        this.user = user
        this.staticUrl = staticUrl
    }

    init() {
        postJson(
            '/payment/get_stripe_details/'
        ).then(({json}) => {
            this.publicKey = json['public_key']
            this.monthlyPlanId = json['monthly_plan_id']
            this.userEmail = json['customer_email']
            return whenReady()
        }).then(() => {
            this.render()
            const smenu = new SiteMenu("") // Nothing highlighted
            smenu.init()
            ensureCSS([
                'payment.css'
            ], this.staticUrl)
        })
    }

    render() {
        document.body = document.createElement('body')
        document.body.innerHTML = baseBodyTemplate({
            contents: advertisementTemplate({}),
            username: this.user.username,
            staticUrl: this.staticUrl
        })
        setDocTitle(gettext('Payment overview'))
        const feedbackTab = new FeedbackTab({staticUrl: this.staticUrl})
        feedbackTab.init()
        const script = document.createElement('script')
        script.text = `
          var stripe = Stripe('${this.publicKey}', {
            betas: ['checkout_beta_4']
          });

          var checkoutButton = document.getElementById('checkout-button');
          checkoutButton.addEventListener('click', function () {
            // When the customer clicks on the button, redirect
            // them to Checkout.
            stripe.redirectToCheckout({
              items: [{plan: '${this.monthlyPlanId}', quantity: 1}],

              // Note that it is not guaranteed your customers will be redirected to this
              // URL *100%* of the time, it's possible that they could e.g. close the
              // tab between form submission and the redirect.
              successUrl: '${window.location.href}',
              cancelUrl: '${window.location.href}',
              customerEmail: '${this.customerEmail}'
            })
            .then(function (result) {
              if (result.error) {
                // If 'redirectToCheckout' fails due to a browser or network
                // error, display the localized error message to your customer.
                var displayError = document.getElementById('error-message');
                displayError.textContent = result.error.message;
              }
            });
          });`
          // Execute script
          document.head.appendChild(script).parentNode.removeChild(script)

    }
}
