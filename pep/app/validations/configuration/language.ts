import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_LANGUAGE_VALIDATIONS = {
    configSettings: {
        home: {
            intro: {
                left: [validatePresence({ presence: true, ignoreBlank: true })],
                right: [validatePresence({ presence: true, ignoreBlank: true })]
            }
        }
    }
};
