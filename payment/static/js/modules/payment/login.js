import {Dialog, ensureCSS, whenReady} from "../common"
import {advertisementTemplate} from "./templates"

export class PaymentLogin {
    constructor({staticUrl, page}) {
        this.staticUrl = staticUrl
        this.loginPage = page
        this.advertisementOpen = false
        ensureCSS([
            'payment.css'
        ], this.staticUrl)
    }

    init() {
        whenReady().then(
            () => this.bind()
        )
    }

    bind() {
        const footerLinks = document.querySelector('.fw-footer-links')
        footerLinks.insertAdjacentHTML(
            'beforeend',
            `<li><a class="pricing">${gettext('Pricing')}</a></li>`
        )
        footerLinks.querySelector('a.pricing').addEventListener('click', event => {
            event.preventDefault()
            if (this.advertisementOpen) {
                return
            }
            const dialog = new Dialog({
                title: gettext('Pricing'),
                body: advertisementTemplate({noUser: true}),
                buttons: [
                    {type: 'close'}
                ]
            })
            dialog.onClose = () => this.advertisementOpen = false
            dialog.open()
            this.advertisementOpen = true
        })
    }
}
