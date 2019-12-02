import {localizeDate} from "../common"

export const advertisementTemplate = ({subscribed, monthly, sixmonths, annual, subscription_end, infoOnly = false}) => `
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
                <button${ subscribed && !subscription_end ? ' class="subscription"' : ''}>
                ${
                    infoOnly ?
                        gettext('Default') :
                        subscribed ?
                            subscription_end ?
                                gettext('Downgrade on ') + subscription_end :
                                gettext('Default') :
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
                <button class="subscription monthly${subscribed==='monthly' ? ' current' : ''}">
                    ${
                        infoOnly ?
                            '' :
                            `${
                                subscribed === 'monthly' ?
                                    subscription_end ?
                                        gettext('Resubscribe') :
                                        gettext('Modify') :
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
                <button class="subscription sixmonths${subscribed==='sixmonths' ? ' current' : ''}">
                    ${
                        infoOnly ?
                            '' :
                            `${
                                subscribed === 'sixmonths' ?
                                    subscription_end ?
                                        gettext('Resubscribe') :
                                        gettext('Modify') :
                                        !subscribed ?
                                            gettext('Sign up') :
                                            gettext('Switch to')
                            } : `
                    }
                    ${sixmonths.price}
                </button>
                ${sixmonths.trial ? `<div>${gettext('Trial')}: ${sixmonths.trial} ${gettext('days')}</div>` : ''}
            </div>
            <div class="price-offer">
                <p><strong>${gettext('Annual payments')}</strong></p>
                <button class="subscription annual${subscribed==='annual' ? ' current' : ''}">
                    ${
                        infoOnly ?
                            '' :
                            `${
                                subscribed === 'annual' ?
                                    subscription_end ?
                                        gettext('Resubscribe') :
                                        gettext('Modify') :
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
