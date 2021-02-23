import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import merge from 'lodash.merge';
import { BASE_CONFIG_NAME, BaseConfiguration, DEFAULT_BASE_CONFIGURATION } from 'pep/constants/configuration';
import AdminCommonController from 'pep/pods/admin/common/controller';
import Configuration from 'pep/pods/configuration/model';
import Validations from 'pep/validations/configuration/common';

export default class AdminCommon extends Route {
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: BASE_CONFIG_NAME });
    }

    setupController(controller: AdminCommonController, model: Configuration, transition: Transition): void {
        super.setupController(controller, model, transition);
        const changeset = merge({}, model, { configSettings: DEFAULT_BASE_CONFIGURATION }) as BaseConfiguration;
        controller.changeset = createChangeset(changeset, Validations);
    }
}
