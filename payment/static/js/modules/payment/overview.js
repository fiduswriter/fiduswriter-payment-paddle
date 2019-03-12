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
            if (this.subscription) {
                postJson(
                    '/payment/cancel_subscription/'
                ).then(
                    () => this.init()
                )
            } else {
                const stripeScript = document.createElement('script')
                stripeScript.src = "https://js.stripe.com/v3"
                document.head.appendChild(stripeScript)
                const script = document.createElement('script')
                script.text = `
                    var stripe = Stripe('${this.publicKey}', {
                        betas: ['checkout_beta_4']
                    });
                    stripe.redirectToCheckout({
                        items: [{plan: '${this.monthlyPlanId}', quantity: 1}],
                        successUrl: '${window.location.href}',
                        cancelUrl: '${window.location.href}',
                        clientReferenceId: '${this.userId}'
                    }).then(function (result) {
                        if (result.error) {
                            var displayError = document.getElementById('error-message');
                            displayError.textContent = result.error.message;
                        }
                    });`
                document.head.appendChild(script)
            }
        })
    }
}
