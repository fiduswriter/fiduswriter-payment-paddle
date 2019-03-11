import {PaymentOverview} from "./overview"

export class PaymentApp {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app.routes['payment'] = () => new PaymentOverview(this.app.config)
        const stripeScript = document.createElement('script')
        stripeScript.src = "https://js.stripe.com/v3"
        document.head.appendChild(stripeScript)
    }
}
