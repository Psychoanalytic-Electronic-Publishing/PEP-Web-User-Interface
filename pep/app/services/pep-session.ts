import SessionService from 'ember-simple-auth/services/session';
import { oneWay } from '@ember/object/computed';
import { PepSecureAuthenticatedData } from 'pep/api';

export interface AuthenticatedData {
    authenticated: PepSecureAuthenticatedData;
}
/**
 * We extend the ember-simple-auth session to strongly type the data object thats stored in it since
 * we need a custom format
 *
 * @export
 * @class Session
 * @extends 'ember-simple-auth/services/session
 */
export default class PepSessionService extends SessionService.extend({
    data: (oneWay('session.content') as unknown) as AuthenticatedData
}) {
    // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'pep-session': PepSessionService;
    }
}
