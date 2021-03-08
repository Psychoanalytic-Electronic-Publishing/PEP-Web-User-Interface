import { validateFormat, validateNumber, validatePresence } from 'ember-changeset-validations/validators';

import { URL_REGEX } from 'pep/constants/regex';

export const CONFIGURATION_PUBLISHER_VALIDATIONS = {
    embargoYears: [validatePresence({ presence: true, ignoreBlank: true }), validateNumber({ integer: true })],
    url: [
        validatePresence({ presence: true, ignoreBlank: true }),
        validateFormat({
            regex: URL_REGEX,
            message: 'urlFormat'
        })
    ],
    sourceCode: [validatePresence({ presence: true, ignoreBlank: true })],
    previewHTML: [validatePresence({ presence: true, ignoreBlank: true })],
    fullHTML: [validatePresence({ presence: true, ignoreBlank: true })]
};
