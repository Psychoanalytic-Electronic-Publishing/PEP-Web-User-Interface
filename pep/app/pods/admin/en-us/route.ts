import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { DEFAULT_CONTENT_CONFIGURATION } from 'pep/constants/configuration';
import AdminCommonController from 'pep/pods/admin/common/controller';
import Configuration from 'pep/pods/configuration/model';
import Validations from 'pep/validations/configuration/en-us';

export default class AdminEnUs extends Route {
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: 'en-us' });
    }

    setupController(controller: AdminCommonController, model: Configuration, transition: Transition): void {
        super.setupController(controller, model, transition);
        model.configSettings = Object.assign({}, DEFAULT_CONTENT_CONFIGURATION, model.configSettings);
        controller.changeset = createChangeset(model, Validations);
    }
}
