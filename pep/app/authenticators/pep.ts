import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { resolve, reject } from 'rsvp';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { SessionAuthenticatedData } from 'ember-simple-auth/services/session';
import AjaxService from 'pep/services/ajax';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';

// TODO: this is all likely to change a bit to account for authentication flow changes
// i.e. using headers/instead of automatic cookie sending, session refreshing, etc

export default class PepAuthenticator extends BaseAuthenticator {
    @service ajax!: AjaxService;

    /**
     * Authenticates and logs the user in
     * @param  {String} username
     * @param {String} password
     */
    async authenticate(username: string, password: string) {
        const params = serializeQueryParams({
            grant_type: 'password',
            username,
            password
        });
        const result = await this.ajax.request(`Session/Login/?${params}`);
        return result;
    }

    /**
     * Invalidates the local session and logs the user out
     */
    async invalidate() {
        try {
            const result = await this.ajax.request('Session/Logout/');
            return result;
        } catch (err) {
            //TODO for now, just pretend that logouts always succeed
            //as there is an issue where the user's session will just expire in the api w/no notice
            return resolve();
        }
    }

    /**
     * Restores the local session from cookies, if one exists
     * @param {SessionAuthenticatedData} data
     */
    restore(data: SessionAuthenticatedData) {
        if (!isEmpty(data.access_token)) {
            return resolve(data);
        } else {
            return reject();
        }
    }
}
