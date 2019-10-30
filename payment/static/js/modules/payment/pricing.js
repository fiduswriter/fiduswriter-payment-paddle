import {ensureCSS} from "../common"
import {advertisementTemplate} from "./templates"

import {PreloginPage} from "../prelogin"

export class PricingPage extends PreloginPage {
    constructor(config) {
        super(config)
        this.title = gettext('Pricing')
        this.contents = advertisementTemplate({noUser: true})
    }

    bind() {
        super.bind()
        ensureCSS([
            'payment.css'
        ], this.staticUrl)
    }
}
