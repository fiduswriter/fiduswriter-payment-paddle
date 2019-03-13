import {postJson} from "../common"

import {PaymentPage} from "./page"

export class PaymentApp {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app.routes['payment'] = () => new PaymentPage(this.app.config)
        this.app.getSubscription = () => {
            if (this.app.subscription) {
                return Promise.resolve(this.app.subscription)
            }
            return postJson(
                '/payment/get_stripe_details/'
            ).then(({json}) => {
                this.app.subscription = {
                    staff: json['staff'],
                    publicKey: json['public_key'],
                    monthlyPlanId: json['monthly_plan_id'],
                    subscribed: json['subscribed'],
                    subscriptionEnd: json['subscription_end'] ? json['subscription_end'] : false
                }
                return this.app.subscription
            })
        }
    }
}
