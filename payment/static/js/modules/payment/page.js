import {advertisementTemplate} from "./templates"
import {whenReady, baseBodyTemplate, setDocTitle, ensureCSS, post} from "../common"
import {SiteMenu} from "../menu"
import {FeedbackTab} from "../feedback"

export class PaymentPage {
    constructor({app, user, staticUrl}) {
        this.app = app
        this.user = user
        this.staticUrl = staticUrl
    }

    init() {
        this.app.getSubscription().then(subscription => {
            this.subscription = subscription
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
            contents: advertisementTemplate(this.subscription),
            user: this.user,
            staticUrl: this.staticUrl
        })
        setDocTitle(gettext('Plan overview'), this.app)
        const feedbackTab = new FeedbackTab({staticUrl: this.staticUrl})
        feedbackTab.init()
        this.bind()
    }

    bind() {
        const subscriptionButton = document.querySelector('#subscription')

        subscriptionButton.addEventListener('click', () => {
            if (this.subscription.subscribed) {
                if (this.subscription.subscriptionEnd) {
                    post(
                        '/api/payment/reactivate_subscription/'
                    ).then(
                        () => {
                            delete this.app.subscription
                            this.init()
                        }
                    )
                } else {
                    post(
                        '/api/payment/cancel_subscription/'
                    ).then(
                        () => {
                            delete this.app.subscription
                            this.init()
                        }
                    )
                }

            } else {
                // We load Stripe.js directly from stripe, as that is a
                // requirement from stripe. We wait with loading it until the
                // user has agreed to sign up so that we don't share any
                // tracking data with third parties - which would likely be in
                // conflict with the GDPR.
                const stripeScript = document.createElement('script')
                stripeScript.onload = () => {
                    window.Stripe(this.subscription.publicKey).redirectToCheckout({
                        items: [{plan: this.subscription.monthlyPlanId, quantity: 1}],
                        successUrl: window.location.href,
                        cancelUrl: window.location.href,
                        clientReferenceId: String(this.user.id)
                    }).then(result => {
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
