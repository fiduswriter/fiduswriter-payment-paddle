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
        this.app.getSubscription().then(() => {
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
            contents: advertisementTemplate(Object.assign({}, this.app.paddleInfo, this.app.subscription)),
            user: this.user,
            staticUrl: this.staticUrl
        })
        setDocTitle(gettext('Plan overview'), this.app)
        const feedbackTab = new FeedbackTab({staticUrl: this.staticUrl})
        feedbackTab.init()
        this.bind()
    }

    bind() {

        const subscriptionMonthlyButton = document.querySelector('.subscription.monthly')
        const subscriptionSixMonthsButton = document.querySelector('.subscription.sixmonths')
        const subscriptionAnnualButton = document.querySelector('.subscription.annual')

        subscriptionMonthlyButton.addEventListener('click', () => this.handleClick('monthly'))
        subscriptionSixMonthsButton.addEventListener('click', () => this.handleClick('sixmonths'))
        subscriptionAnnualButton.addEventListener('click', () => this.handleClick('annual'))

    }

    handleClick(duration) {
        if (this.app.subscription.subscribed) {
            if (this.app.subscription.subscriptionEnd) {
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
            window.Paddle.Checkout.open({
                product: this.app.paddleInfo[duration],
                email: this.user.emails.find(email => email.primary).address,
                allowQuantity: false,
                passthrough: String(this.user.id),
                success: window.location.href
            })
        }
    }
}
