import { validateNumber, validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_PUBLISHER_VALIDATIONS = {
    embargoYears: [validatePresence({ presence: true, ignoreBlank: true }), validateNumber({ integer: true })],
    url: [validatePresence({ presence: true, ignoreBlank: true })],
    sourceCode: [validatePresence({ presence: true, ignoreBlank: true })],
    previewHTML: [validatePresence({ presence: true, ignoreBlank: true })],
    fullHTML: [validatePresence({ presence: true, ignoreBlank: true })]
};
