import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_TOUR_STEP_VALIDATIONS = {
    title: [validatePresence({ presence: true, ignoreBlank: true })],
    text: [validatePresence({ presence: true, ignoreBlank: true })]
};
