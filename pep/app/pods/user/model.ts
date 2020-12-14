import DS from 'ember-data';
import attr from 'ember-data/attr';

import { UserPreferences, DEFAULT_USER_PREFERENCES } from 'pep/constants/preferences';
export enum UserType {
    GROUP = 'Group',
    INDIVIDUAL = 'Individual'
}

export default class User extends DS.Model {
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
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        user: User;
    }
}
