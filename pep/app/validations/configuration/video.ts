import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_VIDEO_VALIDATIONS = {
    url: [validatePresence({ presence: true, ignoreBlank: true })]
};
