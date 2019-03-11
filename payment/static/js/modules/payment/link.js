export class PaymentLink {
    constructor(overviewPage) {
        this.overviewPage = overviewPage
    }

    init() {
        const preferencesPulldown = document.querySelector('#user-preferences-pulldown')
        preferencesPulldown.firstElementChild.insertAdjacentHTML(
            'beforeend',
            `<li>
                <a class="fw-pulldown-item" href="/payment/">
                    ${gettext("Subscription")}
                </a>
            </li>`
        )
    }
}
