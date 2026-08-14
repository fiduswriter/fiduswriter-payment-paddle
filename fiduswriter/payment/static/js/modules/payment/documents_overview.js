import {Dialog} from "fwtoolkit"

export class PaymentDocumentsOverview {
    constructor(overview) {
        this.overview = overview
    }

    canCreateDocument() {
        const sub = this.overview.app.subscription
        return (
            sub &&
            (sub.staff ||
                sub.subscribed ||
                this.overview.documentList.length < 2)
        )
    }

    showSubscriptionDialog() {
        const dialog = new Dialog({
            title: gettext("Subscription warning"),
            body: `<p>${gettext("You have run out of free documents. Sign up for a subscription to create more documents.")}</p>`,
            buttons: [
                {
                    text: gettext("Go to subscription page"),
                    classes: "fw-dark",
                    click: () => {
                        dialog.close()
                        this.overview.app.goTo("/payment/")
                    }
                },
                {type: "close"}
            ]
        })
        dialog.open()
    }

    init() {
        this.overview.goToNewDocumentAction = this.overview.goToNewDocument
        this.overview.goToNewDocument = (...args) => {
            this.overview.app
                .getSubscription()
                .then(() => {
                    if (this.canCreateDocument()) {
                        this.overview.goToNewDocumentAction(...args)
                    } else {
                        this.showSubscriptionDialog()
                    }
                })
                .catch(() => {
                    // Payment is not configured in this installation
                    // (the Paddle endpoints are unavailable). Fall back to
                    // allowing the document to be created.
                    this.overview.goToNewDocumentAction(...args)
                })
        }

        this.overview.importDocumentAction =
            this.overview.mod.actions.importDocument.bind(
                this.overview.mod.actions
            )
        this.overview.mod.actions.importDocument = (...args) =>
            this.overview.app
                .getSubscription()
                .then(() => {
                    if (this.canCreateDocument()) {
                        return this.overview.importDocumentAction(...args)
                    } else {
                        this.showSubscriptionDialog()
                    }
                })
                .catch(() => {
                    // Payment is not configured in this installation
                    // (the Paddle endpoints are unavailable). Fall back to
                    // allowing the document to be imported.
                    return this.overview.importDocumentAction(...args)
                })
    }
}
