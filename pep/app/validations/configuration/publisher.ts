import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_PUBLISHER_VALIDATIONS = {
    description: [validatePresence({ presence: true, ignoreBlank: true })],
    sourceCode: [validatePresence({ presence: true, ignoreBlank: true })],
    previewHTML: [validatePresence({ presence: true, ignoreBlank: true })],
    fullHTML: [validatePresence({ presence: true, ignoreBlank: true })]
};
