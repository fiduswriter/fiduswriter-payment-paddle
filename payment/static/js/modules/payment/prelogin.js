export class PaymentPrelogin {
    constructor({page}) {
        console.log('sraert')
        this.preloginPage = page
    }

    init() {
        console.log('dedede')
        this.preloginPage.footerLinks.push(
            {
                text: gettext("Pricing"),
                link: '/pricing/'
            }
        )
    }
}
