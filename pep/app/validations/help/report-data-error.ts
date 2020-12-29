import { validatePresence } from 'ember-changeset-validations/validators';

const REPORT_DATA_ERROR_VALIDATIONS = {
    correctedText: [validatePresence({ presence: true, ignoreBlank: true })],
    email: [validatePresence({ presence: true, ignoreBlank: true })],
    fullName: [validatePresence({ presence: true, ignoreBlank: true })],
    urlProblemPage: [validatePresence({ presence: true, ignoreBlank: true, description: 'Problem URL' })]
};

export default REPORT_DATA_ERROR_VALIDATIONS;
