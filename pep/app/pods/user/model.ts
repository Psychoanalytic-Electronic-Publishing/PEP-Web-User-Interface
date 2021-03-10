import DS from 'ember-data';
import attr from 'ember-data/attr';
import IntlService from 'ember-intl/services/intl';
import moment, { Moment } from 'moment';
import { SERVER_DATE_FORMAT } from 'pep/constants/dates';
import { DEFAULT_USER_PREFERENCES, UserPreferences } from 'pep/constants/preferences';

import { inject as service } from '@ember/service';

export enum UserType {
    GROUP = 'Group',
    INDIVIDUAL = 'Individual',
    ADMIN = 'Admin'
}

interface ActiveSubscription {
    ProductCode: string;
    ProductName: string;
    OrderedViaName: string;
    RecurringSubscriptionEndDate: Moment;
    RecurringSubscriptionStartDate: Moment;
}

export default class User extends DS.Model {
    @service intl!: IntlService;

    @attr('string') activeSubscriptions!: string;
    @attr('boolean') branding!: boolean;
    @attr('string') brandingImgUrl!: string;
    @attr<any>('json', { defaultValue: () => ({ ...DEFAULT_USER_PREFERENCES }) }) clientSettings!: UserPreferences;
    @attr('string') emailAddress!: string;
    @attr('boolean') hasArchiveAccess!: boolean;
    @attr('boolean') hasCurrentAccess!: boolean;
    @attr('string') loggedInMethod!: string;
    @attr('string') paDSHomeURL!: string;
    @attr('date') subscriptionEndDate!: Date;
    @attr('string') userFullName!: string;
    @attr('string') userName!: string;
    @attr('string') userType!: UserType;

    /**
     * Is the user an individual login (not part of a group)
     *
     * @readonly
     * @type {boolean}
     * @memberof User
     */
    get isIndividual(): boolean {
        return this.userType === UserType.INDIVIDUAL;
    }

    /**
     * Is the user part of a group (IP, federated, or referral)
     *
     * @readonly
     * @type {boolean}
     * @memberof User
     */
    get isGroup(): boolean {
        return this.userType === UserType.GROUP;
    }

    /**
     * Is the user an admin
     *
     * @readonly
     * @type {boolean}
     * @memberof User
     */
    get isAdmin(): boolean {
        return this.userType === UserType.ADMIN;
    }

    get activeSubscriptionsJSON(): ActiveSubscription[] {
        return this.activeSubscriptions
            ? JSON.parse(this.activeSubscriptions).map((subscription: ActiveSubscription) => {
                  return {
                      ...subscription,
                      RecurringSubscriptionStartDate: moment(
                          subscription.RecurringSubscriptionStartDate,
                          SERVER_DATE_FORMAT
                      ),
                      RecurringSubscriptionEndDate: moment(
                          subscription.RecurringSubscriptionEndDate,
                          SERVER_DATE_FORMAT
                      )
                  };
              })
            : [];
    }
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        user: User;
    }
}
