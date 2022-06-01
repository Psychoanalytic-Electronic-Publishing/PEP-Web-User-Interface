import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import mergeWith from 'lodash.mergewith';
import { BASE_CONFIG_NAME, BaseConfiguration, DEFAULT_BASE_CONFIGURATION } from 'pep/constants/configuration';
import { SearchTermId } from 'pep/constants/search';
import AdminGeneralController from 'pep/pods/admin/general/controller';
import Configuration from 'pep/pods/configuration/model';
import { mergingCustomizer } from 'pep/utils/admin';
import { CONFIGURATION_GENERAL_VALIDATIONS } from 'pep/validations/configuration/general';

export interface AdminField {
    id: number;
    field: SearchTermId;
}
export default class AdminGeneral extends Route {
    /**
     * Load the base config
     *
     * @return {*}  {Promise<Configuration>}
     *
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

        model.configSettings = mergeWith({}, DEFAULT_BASE_CONFIGURATION, model.configSettings, mergingCustomizer);
        const changeset = createChangeset<Configuration>(model, CONFIGURATION_GENERAL_VALIDATIONS);
        controller.changeset = changeset;
        const fields = (model.configSettings as BaseConfiguration).search.terms.defaultFields;
        controller.fields = fields.map((field, index) => {
            return {
                id: index,
                field
            };
        });
        const leftSidebarItems = (model.configSettings as BaseConfiguration).global.cards.left;
        const rightSidebarItems = (model.configSettings as BaseConfiguration).global.cards.right;

        controller.leftSidebarItems = [...new Map(leftSidebarItems.map((item) => [item['widget'], item])).values()];
        controller.rightSidebarItems = [...new Map(rightSidebarItems.map((item) => [item['widget'], item])).values()];
    }
}
