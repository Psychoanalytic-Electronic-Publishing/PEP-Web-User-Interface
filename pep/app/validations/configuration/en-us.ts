import { validatePresence } from 'ember-changeset-validations/validators';

const FEEDBACK_VALIDATIONS = {
    configSettings: {
        home: {
            intro: {
                left: [validatePresence({ presence: true, ignoreBlank: true })],
                right: [validatePresence({ presence: true, ignoreBlank: true })]
            }
        }
    }
};

export default FEEDBACK_VALIDATIONS;
