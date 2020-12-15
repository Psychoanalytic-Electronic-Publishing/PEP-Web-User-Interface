import DS from 'ember-data';
import attr from 'ember-data/attr';
import moment, { Moment } from 'moment';
import { SERVER_DATE_FORMAT } from 'pep/constants/dates';

import { UserPreferences, DEFAULT_USER_PREFERENCES } from 'pep/constants/preferences';
export enum UserType {
    GROUP = 'Group',
    INDIVIDUAL = 'Individual'
}

interface ActiveSubscription {
    ProductCode: string;
    ProductName: string;
    OrderedViaName: string;
    RecurringSubscriptionEndDate: Moment;
    RecurringSubscriptionStartDate: Moment;
}

export default class User extends DS.Model {
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
