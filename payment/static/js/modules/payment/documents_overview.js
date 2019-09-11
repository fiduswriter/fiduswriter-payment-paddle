import {Dialog} from "../common"

export class PaymentDocumentsOverview {
    constructor(overview) {
        this.overview = overview
    }

    init() {
        this.overview.goToNewDocument = id => {
            this.overview.app.getSubscription().then(subscription => {
                if (
                    subscription.staff ||
                    subscription.subscribed ||
                    this.overview.documentList.length < 4
                ) {
                    this.overview.app.goTo(`/document/${id}/`)
                } else {
                    const dialog = new Dialog({
                        title: gettext('Subscription warning'),
                        body: `<p>${gettext('You have run out of free documents. Sign up for a subscription to create more documents.')}</p>`,
                        buttons: [
                            {
                                text: gettext('Go to subscription page'),
                                classes: 'fw-dark',
                                click: () => {
                                    dialog.close()
                                    this.overview.app.goTo(`/payment/`)
                                }
                            },
                            {type: 'close'}
                        ]
                    })
                    dialog.open()
                }
            })
        }
    }
}
