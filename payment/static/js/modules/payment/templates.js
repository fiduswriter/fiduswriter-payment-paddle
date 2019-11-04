import {localizeDate} from "../common"

export const advertisementTemplate = ({subscribed, subscriptionEnd, noUser = false}) => `
<div class="pricing-guide">
    <h1>${gettext('Pricing Guide')}</h1>
    <p>
        ${gettext('You can write 4 documents on the Free Plan without any trial period.')}
        <br>
        ${gettext('If you want to write more documents, you can upgrade your plan here:')}
    </p>
    <div class="price-boxes">
        <div class="price-box">
            <h3>${gettext('Basic')}</h3>
            <h2>${gettext('Free Plan')}</h2>
            <button ${ subscribed && !subscriptionEnd ? 'id="subscription"' : ''}>
            ${
                noUser ?
                    gettext('Default') :
                    subscribed ?
                        subscriptionEnd ?
                            gettext('Downgrade on ') + localizeDate(subscriptionEnd*1000, 'sortable-date') :
                            gettext('Downgrade') :
                        gettext('Current')
            }
            </button>
            <ul class="fa-ul">
                <li><i class="fa-li fa fa-check"></i>${gettext('4 free documents')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited collaborators')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited bibliography items')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited exports')}</li>
            </ul>
        </div>
        <div class="price-box upgrade">
            <h3>${gettext('Premium')}</h3>
            <h2>${gettext('4 €/month')}</h2>
            <button ${ subscribed && !subscriptionEnd ? '' : 'id="subscription"'}>
            ${
                noUser ?
                    gettext('Premium') :
                    subscribed ?
                        subscriptionEnd ?
                            gettext('Reactivate') :
                            gettext('Current') :
                        gettext('Upgrade')
            }
            </button>
            <ul class="fa-ul">
                <li><i class="fa-li fa fa-check"></i><strong>${gettext('Unlimited')}</strong> ${gettext('documents')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited collaborators')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited bibliography items')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited exports')}</li>
            </ul>
        </div>
    </div>
    <div id="error-message"></div>
</div>`
