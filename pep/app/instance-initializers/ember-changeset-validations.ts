import ApplicationInstance from '@ember/application/instance';
import { isNone } from '@ember/utils';

import Messages from 'ember-changeset-validations/utils/messages';

/**
 * Override Ember-Validators exported `formatMessage()` method to allow
 * for translation of validation messages.
 *
 * @export
 * @param {ApplicationInstance} applicationInstance
 */
export function initialize(applicationInstance: ApplicationInstance) {
    const intl = applicationInstance.lookup('service:intl');
    Messages.formatMessage = (message: string, context = {}) => {
        const errorKey = message;
        if (isNone(errorKey) || typeof errorKey !== 'string') {
            return intl.t('validations.invalid');
        }
        return intl.t(`validations.${errorKey}`, context);
    };
}
export default {
    initialize
};
