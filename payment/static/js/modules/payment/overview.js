import {advertisementTemplate} from "./templates"
import {whenReady, baseBodyTemplate, setDocTitle, ensureCSS, postJson, post} from "../common"
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
            this.userId = json['user_id']
            this.subscribed = json['subscribed']
            ensureCSS([
                'payment.css'
            ], this.staticUrl)
            return whenReady()
        }).then(() => {
            this.render()
            const smenu = new SiteMenu("") // Nothing highlighted
            smenu.init()
        })
    }

    render() {
        document.body = document.createElement('body')
        document.body.innerHTML = baseBodyTemplate({
            contents: advertisementTemplate({subscribed: this.subscribed}),
            username: this.user.username,
            staticUrl: this.staticUrl
        })
        setDocTitle(gettext('Plan overview'))
        const feedbackTab = new FeedbackTab({staticUrl: this.staticUrl})
        feedbackTab.init()
        this.bind()
    }

    bind() {
        const subscriptionButton = document.querySelector('#subscription')

        subscriptionButton.addEventListener('click', () => {
            if (this.subscribed) {
                post(
                    '/payment/cancel_subscription/'
                ).then(
                    () => this.init()
                )
            } else {
                // We load Stripe.js directly from stripe, as that is a
                // requirement from stripe. We wait with loading it until the
                // user has agreed to sign up so that we don't share any
                // tracking data with third parties - which would likely be in
                // conflict with the GDPR.
                const stripeScript = document.createElement('script')
                stripeScript.onload = () => {
                    window.Stripe(this.publicKey, {
                        betas: ['checkout_beta_4']
                    }).redirectToCheckout({
                        items: [{plan: this.monthlyPlanId, quantity: 1}],
                        successUrl: window.location.href,
                        cancelUrl: window.location.href,
                        clientReferenceId: String(this.userId)
                    }).then(function (result) {
                        if (result.error) {
                            const displayError = document.getElementById('error-message')
                            displayError.textContent = result.error.message
                        }
                    })
                }
                document.head.appendChild(stripeScript)
                stripeScript.src = "https://js.stripe.com/v3"
            }
        })
    }
}
