import {postJson} from "../common"

import {PaymentPage} from "./page"
import {PricingPage} from "./pricing"

export class PaymentApp {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app.routes['payment'] = {
            requireLogin: true,
            open: () => new PaymentPage(this.app.config)
        }
        this.app.routes['pricing'] = {
            open: () => new PricingPage(this.app.config)
        }

        this.app.getPaddleInfo = () => {
            if (this.app.paddleInfo) {
                return Promise.resolve()
            }
            return new Promise(resolve => {
                const paddleScript = document.createElement('script')
                paddleScript.onload = () => {
                    resolve()
                }
                document.head.appendChild(paddleScript)
                paddleScript.src = "https://cdn.paddle.com/paddle/paddle.js"
            }).then(
                () => postJson(
                    '/api/payment/get_paddle_info/'
                )
            ).then(({json}) => {
                const paddleInfo = {
                    monthlyPlanId: json['monthly_plan_id'],
                    sixMonthsPlanId: json['six_months_plan_id'],
                    annualPlanId: json['annual_plan_id'],
                    vendorId: json['vendor_id']
                }
                window.Paddle.Setup({
                    vendor: paddleInfo.vendorId
                })
                return Promise.all([
                    new Promise(resolve => window.Paddle.Product.Prices(
                        paddleInfo.monthlyPlanId,
                        response => resolve({
                            price: response.recurring.price.gross,
                            trial: response.recurring.subscription.trial_days
                        })
                    )),
                    new Promise(resolve => window.Paddle.Product.Prices(
                        paddleInfo.sixMonthsPlanId,
                        response => resolve({
                            price: response.recurring.price.gross,
                            trial: response.recurring.subscription.trial_days
                        })
                    )),
                    new Promise(resolve => window.Paddle.Product.Prices(
                        paddleInfo.annualPlanId,
                        response => resolve({
                            price: response.recurring.price.gross,
                            trial: response.recurring.subscription.trial_days
                        })
                    ))
                ]).then(
                    ([monthly, sixMonths, annual]) => {
                        paddleInfo.monthly = monthly
                        paddleInfo.sixMonths = sixMonths
                        paddleInfo.annual = annual
                        this.app.paddleInfo = paddleInfo
                        return Promise.resolve()
                    }
                )
            })
        }

        this.app.getSubscription = () => {
            if (this.app.subscription) {
                return Promise.resolve()
            }
            return this.app.getPaddleInfo().then(
                () => postJson(
                    '/api/payment/get_subscription_details/'
                )
            ).then(({json}) => {
                this.app.subscription = {
                    staff: json['staff'],
                    publicKey: json['public_key'],
                    subscribed: json['subscribed'],
                    subscriptionEnd: json['subscription_end'] ? json['subscription_end'] : false
                }
                return Promise.resolve()
            })
        }
    }
}
