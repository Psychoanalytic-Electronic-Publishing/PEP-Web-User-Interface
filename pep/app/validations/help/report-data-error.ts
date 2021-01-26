import { validatePresence, validateFormat } from 'ember-changeset-validations/validators';

const REPORT_DATA_ERROR_VALIDATIONS = {
    correctedText: [validatePresence({ presence: true, ignoreBlank: true, description: 'Corrections description' })],
    email: [
        validatePresence({ presence: true, ignoreBlank: true }),
        validateFormat({ type: 'email', allowBlank: true })
    ],
    fullName: [validatePresence({ presence: true, ignoreBlank: true })],
    urlProblemPage: [validatePresence({ presence: true, ignoreBlank: true, description: 'URL' })]
};

export default REPORT_DATA_ERROR_VALIDATIONS;
