import {localizeDate} from "../common"

export const advertisementTemplate = ({subscribed, monthly, sixMonths, annual, subscriptionEnd, infoOnly = false}) => `
<div class="pricing-guide${ infoOnly ? ' info-only' : ''}">
    <h1>${gettext('Pricing Guide')}</h1>
    <p>
        ${gettext('You can write 2 documents on the Free Plan without any trial period.')}
        <br>
        ${gettext('If you want to write more documents, you can upgrade your plan here:')}
    </p>
    <div class="price-boxes">
        <div class="price-box">
            <h3>${gettext('Basic')}</h3>
            <h2>${gettext('Free Plan')}</h2>
            <ul class="fa-ul">
                <li><i class="fa-li fa fa-check"></i>${gettext('2 free documents')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited collaborators')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited bibliography items')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited exports')}</li>
            </ul>
            <div class="price-offer">
                <button${ subscribed && !subscriptionEnd ? ' class="subscription"' : ''}>
                ${
                    infoOnly ?
                        gettext('Default') :
                        subscribed ?
                            subscriptionEnd ?
                                gettext('Downgrade on ') + localizeDate(subscriptionEnd*1000, 'sortable-date') :
                                gettext('Downgrade') :
                            gettext('Current')
                }
                </button>
            </div>
        </div>
        <div class="price-box upgrade">
            <h3>${gettext('Premium')}</h3>
            <h2>${gettext('Paid Plan')}</h2>
            <ul class="fa-ul">
                <li><i class="fa-li fa fa-check"></i><strong>${gettext('Unlimited')}</strong> ${gettext('documents')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited collaborators')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited bibliography items')}</li>
                <li><i class="fa-li fa fa-check"></i>${gettext('Unlimited exports')}</li>
            </ul>
            <div class="price-offer">
                <p><strong>${gettext('Monthly payments')}</strong></p>
                <button class="subscription monthly">
                    ${
                        infoOnly ?
                            '' :
                            `${
                                subscribed === 'monthly' ?
                                    subscriptionEnd ?
                                        gettext('Reactivate') :
                                        gettext('Cancel') :
                                        !subscribed ?
                                            gettext('Sign up') :
                                            gettext('Switch to')
                            } : `
                    }
                    ${monthly.price}
                </button>
                ${monthly.trial ? `<div>${gettext('Trial')}: ${monthly.trial} ${gettext('days')}</div>` : ''}
            </div>
            <div class="price-offer">
                <p><strong>${gettext('Semiannual payments')}</strong></p>
                <button class="subscription sixmonths">
                    ${
                        infoOnly ?
                            '' :
                            `${
                                subscribed === 'sixmonths' ?
                                    subscriptionEnd ?
                                        gettext('Reactivate') :
                                        gettext('Cancel') :
                                        !subscribed ?
                                            gettext('Sign up') :
                                            gettext('Switch to')
                            } : `
                    }
                    ${sixMonths.price}
                </button>
                ${sixMonths.trial ? `<div>${gettext('Trial')}: ${sixMonths.trial} ${gettext('days')}</div>` : ''}
            </div>
            <div class="price-offer">
                <p><strong>${gettext('Annual payments')}</strong></p>
                <button class="subscription annual">
                    ${
                        infoOnly ?
                            '' :
                            `${
                                subscribed === 'annual' ?
                                    subscriptionEnd ?
                                        gettext('Reactivate') :
                                        gettext('Cancel') :
                                        !subscribed ?
                                            gettext('Sign up') :
                                            gettext('Switch to')
                            } : `
                    }
                    ${annual.price}
                </button>
                ${annual.trial ? `<div>${gettext('Trial')}: ${annual.trial} ${gettext('days')}</div>` : ''}
            </div>
        </div>
    </div>
    <div id="error-message"></div>
</div>`
