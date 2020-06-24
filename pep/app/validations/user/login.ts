import { validatePresence } from 'ember-changeset-validations/validators';

export default {
    username: [validatePresence({ presence: true, ignoreBlank: true })],
    password: [validatePresence({ presence: true, ignoreBlank: false })]
};
