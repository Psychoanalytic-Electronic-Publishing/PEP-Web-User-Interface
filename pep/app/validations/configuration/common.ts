import { validatePresence } from 'ember-changeset-validations/validators';

const FEEDBACK_VALIDATIONS = {
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

export default FEEDBACK_VALIDATIONS;
