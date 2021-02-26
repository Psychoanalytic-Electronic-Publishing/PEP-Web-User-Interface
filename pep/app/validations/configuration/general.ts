import { validateNumber, validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_GENERAL_VALIDATIONS = {
    configSettings: {
        global: {
            cards: {
                videoPreview: {
                    code: [validatePresence({ presence: true, ignoreBlank: true })]
                },
                whatsNew: {
                    limit: [validatePresence({ presence: true, ignoreBlank: true }), validateNumber({ integer: true })]
                },
                mostCited: {
                    limit: [validatePresence({ presence: true, ignoreBlank: true }), validateNumber({ integer: true })]
                },
                mostViewed: {
                    limit: [validatePresence({ presence: true, ignoreBlank: true }), validateNumber({ integer: true })]
                }
            }
        }
    }
};
