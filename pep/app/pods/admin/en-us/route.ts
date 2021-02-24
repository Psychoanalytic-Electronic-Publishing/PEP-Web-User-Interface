import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { DEFAULT_CONTENT_CONFIGURATION } from 'pep/constants/configuration';
import AdminCommonController from 'pep/pods/admin/common/controller';
import Configuration from 'pep/pods/configuration/model';
import Validations from 'pep/validations/configuration/en-us';

export default class AdminEnUs extends Route {
    /**
     * Load the english configuration
     *
     * @return {*}  {Promise<Configuration>}
     * @memberof AdminEnUs
     */
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: 'en-us' });
    }

    /**
     * Combine the loaded config with the default configs as backup so we always have a full config item built, then create a changeset
     *
     * @param {AdminCommonController} controller
     * @param {Configuration} model
     * @param {Transition} transition
     * @memberof AdminEnUs
     */
    setupController(controller: AdminCommonController, model: Configuration, transition: Transition): void {
        super.setupController(controller, model, transition);
        model.configSettings = Object.assign({}, DEFAULT_CONTENT_CONFIGURATION, model.configSettings);
        controller.changeset = createChangeset(model, Validations);
    }
}
