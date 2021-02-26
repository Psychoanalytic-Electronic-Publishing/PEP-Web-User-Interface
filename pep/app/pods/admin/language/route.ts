import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { DEFAULT_CONTENT_CONFIGURATION } from 'pep/constants/configuration';
import { LanguageCode, Languages } from 'pep/constants/lang';
import AdminController from 'pep/pods/admin/controller';
import AdminLanguageController from 'pep/pods/admin/language/controller';
import Configuration from 'pep/pods/configuration/model';
import { CONFIGURATION_LANGUAGE_VALIDATIONS } from 'pep/validations/configuration/language';

export default class AdminLanguage extends Route {
    /**
     * Load the english configuration
     *
     * @return {*}  {Promise<Configuration>}
     * @memberof AdminLanguage
     */
    model(params: { lang_code: LanguageCode }): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: params.lang_code });
    }

    /**
     * Combine the loaded config with the default configs as backup so we always have a full config item built, then create a changeset
     *
     * @param {AdminLanguageController} controller
     * @param {Configuration} model
     * @param {Transition} transition
     * @memberof AdminLanguage
     */
    setupController(controller: AdminLanguageController, model: Configuration, transition: Transition): void {
        super.setupController(controller, model, transition);
        model.configSettings = Object.assign({}, DEFAULT_CONTENT_CONFIGURATION, model.configSettings);
        controller.changeset = createChangeset(model, CONFIGURATION_LANGUAGE_VALIDATIONS);
        const langId = model.configName as LanguageCode;
        controller.language = Languages.findBy('code', langId);
        const adminController = this.controllerFor('admin') as AdminController;
        adminController.selectedLanguage = langId;
    }

    /**
     * When we leave the language route, set the selected language to undefined so we dont show the route as active in the admin navbar
     *
     * @param {AdminLanguageController} controller
     * @param {boolean} isExiting
     * @param {Transition} transition
     * @memberof AdminLanguage
     */
    resetController(_controller: AdminLanguageController, _isExiting: boolean, _transition: Transition) {
        const adminController = this.controllerFor('admin') as AdminController;
        adminController.selectedLanguage = undefined;
    }
}
