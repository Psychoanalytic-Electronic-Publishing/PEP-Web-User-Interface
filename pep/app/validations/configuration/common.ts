import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_COMMON_VALIDATIONS = {
    configSettings: {
        global: {
            cards: {
                videoPreview: {
                    code: [validatePresence({ presence: true, ignoreBlank: true })]
                },
                whatsNew: {
                    limit: [validatePresence({ presence: true, ignoreBlank: true })]
                },
                mostCited: {
                    limit: [validatePresence({ presence: true, ignoreBlank: true })]
                },
                mostViewed: {
                    limit: [validatePresence({ presence: true, ignoreBlank: true })]
                }
            }
        }
    }
};
