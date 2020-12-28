import { validatePresence } from 'ember-changeset-validations/validators';

const REPORT_DATA_ERROR_VALIDATIONS = {
    correctedText: [validatePresence({ presence: true, ignoreBlank: true })]
};

export default REPORT_DATA_ERROR_VALIDATIONS;
