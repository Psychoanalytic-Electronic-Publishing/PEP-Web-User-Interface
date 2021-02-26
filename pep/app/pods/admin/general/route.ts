import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { BASE_CONFIG_NAME, DEFAULT_BASE_CONFIGURATION } from 'pep/constants/configuration';
import AdminGeneralController from 'pep/pods/admin/general/controller';
import Configuration from 'pep/pods/configuration/model';
import { CONFIGURATION_GENERAL_VALIDATIONS } from 'pep/validations/configuration/general';

export default class AdminGeneral extends Route {
    /**
     * Load the base config
     *
     * @return {*}  {Promise<Configuration>}
     * @memberof AdminGeneral
     */
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: BASE_CONFIG_NAME });
    }

    /**
     * Create the changeset and set it as a property on the controller
     *
     * @param {AdminGeneralController} controller
     * @param {Configuration} model
     * @param {Transition} transition
     * @memberof AdminGeneral
     */
    setupController(controller: AdminGeneralController, model: Configuration, transition: Transition): void {
        super.setupController(controller, model, transition);
        model.configSettings = Object.assign({}, DEFAULT_BASE_CONFIGURATION, model.configSettings);
        controller.changeset = createChangeset(model, CONFIGURATION_GENERAL_VALIDATIONS);
    }
}
