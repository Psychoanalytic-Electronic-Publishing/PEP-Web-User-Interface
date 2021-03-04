import { validatePresence } from 'ember-changeset-validations/validators';

export const CONFIGURATION_EXPERT_PICK_VALIDATIONS = {
    articleId: [validatePresence({ presence: true, ignoreBlank: true })],
    imageId: [validatePresence({ presence: true, ignoreBlank: true })]
};
