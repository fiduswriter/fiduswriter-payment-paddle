import {PaymentOverview} from "./overview"

export class PaymentApp {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app.routes['payment'] = () => new PaymentOverview(this.app.config)
    }
}
