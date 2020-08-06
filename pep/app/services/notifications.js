import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import NotificationService from 'ember-cli-notifications/services/notifications';

export default class Notifications extends NotificationService {
    @service intl;

    /**
     * Displays toast notifications for the given server errors
     * @param {ApiServerErrorResponse} payload
     * @param {Object} options
     */
    errors(payload, options) {
        const errors = !payload || isEmpty(payload.errors) ? [{ code: 'unknown.unexpected' }] : payload.errors;

        errors.forEach((error) => {
            const message = this.intl.t(`serverErrors.${error.code}`, {
                meta: error.meta,
                defaultMessage: error.message.detail || error.detail
            });
            this.addNotification(
                Object.assign(
                    {
                        message,
                        type: 'error'
                    },
                    options
                )
            );
        });
    }

    /**
     * Displays a single grouped toast notification for the given server errors
     * @param {ApiServerErrorResponse} payload
     * @param {Object} options
     */
    groupErrors(payload, options) {
        if (!payload || isEmpty(payload.errors)) {
            return this.errors(payload, options);
        }

        const errors = payload.errors;
        const heading = options.groupHeading || this.intl.t('serverErrors.heading', { count: errors.length });
        const message = `
        <div>
            <p>${heading}</p>
            <ul>
                ${errors.reduce(
                    (prev, e) =>
                        `${prev}<li>${this.intl.t(`serverErrors.${e.code}`, {
                            meta: e.meta,
                            defaultMessage: (e.message && e.message.detail) || e.detail
                        })}</li>`,
                    ''
                )}
            </ul>
        </div>`;

        this.addNotification(
            Object.assign(
                {
                    message,
                    type: 'error',
                    htmlContent: true
                },
                options
            )
        );
    }
}
