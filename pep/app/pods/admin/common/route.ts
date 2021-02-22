import Route from '@ember/routing/route';

import { BASE_CONFIG_NAME } from 'pep/constants/configuration';

export default class AdminCommon extends Route {
    model() {
        return this.store.queryRecord('configuration', { configname: BASE_CONFIG_NAME });
    }
}
