import {addDropdownBox, whenReady, activateWait, deactivateWait, post, addAlert, baseBodyTemplate, findTarget, setDocTitle} from "../common"
import {SiteMenu} from "../menu"
import {FeedbackTab} from "../feedback"

export class PaymentOverview {
    constructor({app, user, staticUrl}) {
        this.app = app
        this.user = user
        this.staticUrl = staticUrl
    }

    init() {
        whenReady().then(() => {
            this.render()
            const smenu = new SiteMenu("") // Nothing highlighted
            smenu.init()
        })
    }

    render() {
        document.body = document.createElement('body')
        document.body.innerHTML = baseBodyTemplate({
            contents: 'HELLO',
            username: this.user.username,
            staticUrl: this.staticUrl
        })
        setDocTitle(gettext('Payment overview'))
        const feedbackTab = new FeedbackTab({staticUrl: this.staticUrl})
        feedbackTab.init()
    }
}
