import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { resolve, reject } from 'rsvp';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import AjaxService from 'pep/services/ajax';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';

export default class PepAuthenticator extends BaseAuthenticator {
    @service ajax!: AjaxService;

    async authenticate(username: string, password: string) {
        const params = serializeQueryParams({
            grant_type: 'password',
            username,
            password
        });
        const result = await this.ajax.request(`Session/Login/?${params}`);
        return result;
    }

    async invalidate() {
        const result = await this.ajax.request('Session/Logout/');
        return result;
    }

    restore(data) {
        if (!isEmpty(data['access_token'])) {
            return resolve(data);
        } else {
            return reject();
        }
    }
}
