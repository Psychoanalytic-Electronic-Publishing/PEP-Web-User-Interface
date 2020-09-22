import DS from 'ember-data';
import attr from 'ember-data/attr';

import { UserPreferences, DEFAULT_USER_PREFERENCES } from 'pep/constants/preferences';

export default class User extends DS.Model {
    @attr('boolean') branding!: boolean;
    @attr('string') brandingImgUrl!: string;
    @attr<any>('json', { defaultValue: () => ({ ...DEFAULT_USER_PREFERENCES }) }) clientSettings!: UserPreferences;
    @attr('boolean') hasArchiveAccess!: boolean;
    @attr('boolean') hasCurrentAccess!: boolean;
    @attr('date') subscriptionEndDate!: Date;
    @attr('string') userName!: string;
    @attr('string') userType!: string;
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        user: User;
    }
}
