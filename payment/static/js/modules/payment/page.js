import {advertisementTemplate} from "./templates"
import {whenReady, baseBodyTemplate, setDocTitle, ensureCSS, post, Dialog} from "../common"
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
        if (this.app.subscription.subscribed &! this.app.subscription.subscriptionEnd) {
            if (this.app.subscription.subscribed === duration) {
                const dialog = new Dialog({
                    id: 'figure-dialog',
                    title: gettext("Modify subscription"),
                    body: gettext('Please choose whether to update payment details or to cancel your subscription.'),
                    buttons: [
                        {
                            text: gettext('Update payment details'),
                            classes: 'fw-dark',
                            click: () => window.Paddle.Checkout.open({
                                override: this.app.subscription.update_url,
                                success: window.location.href
                            })
                        },
                        {
                            text: gettext('Cancel subscription'),
                            classes: 'fw-dark',
                            click: () => window.Paddle.Checkout.open({
                                override: this.app.subscription.cancel_url,
                                success: window.location.href
                            })
                        },
                        {
                            type: 'cancel'
                        }
                    ]
                })

                dialog.open()
            } else {
                const dialog = new Dialog({
                    id: 'figure-dialog',
                    title: gettext("Switch subscription"),
                    body: gettext('Do you really want to switch your subscription type?'),
                    buttons: [
                        {
                            text: gettext('Yes'),
                            classes: 'fw-dark',
                            click: () => post(
                                '/proxy/payment/update_subscription',
                                {
                                    plan_id: this.app.paddleInfo[duration].id,
                                }
                            ).then(
                                () => () => {
                                    delete this.app.subscription
                                    this.init()
                                }
                            )
                        },
                        {
                            type: 'cancel'
                        }
                    ]
                })

                dialog.open()

            }

        } else {
            window.Paddle.Checkout.open({
                product: this.app.paddleInfo[duration].id,
                email: this.user.emails.find(email => email.primary).address,
                allowQuantity: false,
                passthrough: String(this.user.id),
                success: window.location.href
            })
        }
    }
}
