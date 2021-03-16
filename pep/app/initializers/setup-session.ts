import Application from '@ember/application';

/**
 * Inject ember-simple-auth's internal session into our overriden session
 *
 * @export
 * @param {Application} application
 */
export function initialize(application: Application): void {
    application.inject('service:session', 'session', 'session:main');
}

export default {
    initialize
};
