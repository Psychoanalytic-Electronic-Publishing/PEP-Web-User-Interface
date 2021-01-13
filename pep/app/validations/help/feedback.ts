import { validatePresence } from 'ember-changeset-validations/validators';

const FEEDBACK_VALIDATIONS = {
    description: [validatePresence({ presence: true, ignoreBlank: true })],
    subject: [validatePresence({ presence: true, ignoreBlank: true })],
    url: [validatePresence({ presence: true, ignoreBlank: true, description: 'URL' })]
};

export default FEEDBACK_VALIDATIONS;
