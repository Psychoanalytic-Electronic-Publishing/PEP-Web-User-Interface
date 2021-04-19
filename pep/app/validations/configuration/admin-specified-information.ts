import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_ADMIN_SPECIFIED_INFORMATION = {
    id: [validatePresence({ presence: true, ignoreBlank: true })],
    value: [validatePresence({ presence: true, ignoreBlank: true })]
};
