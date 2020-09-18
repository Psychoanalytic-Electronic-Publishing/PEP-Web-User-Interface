import DS from 'ember-data';
import { inject as service } from '@ember/service';
import { classify } from '@ember/string';
import { pluralize } from 'ember-inflector';

import ApplicationAdapter from 'pep/pods/application/adapter';
import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';
import { serializeQueryParams } from 'pep/utils/url';

export default class UserAdapter extends ApplicationAdapter {
    @service('pep-session') session!: PepSessionService;

    host = ENV.authBaseUrl;
    // TODO we probably should eventually break the "api/v1" off of
    // AUTH_BASE_URL in an AUTH_NAMESPACE env var, to match the API
    // and allow independently changing it per environ, if needed.
    namespace = '';

    /**
     * Customize the default model endpoint path
     * The PaDS endpoint for users is /api/v1/Users
     * @param {String} modelName
     */
    pathForType<K extends string | number>(modelName: K) {
        const path = super.pathForType(modelName);
        return pluralize(classify(path));
    }

    /**
     * Users are updated in PaDS by passing the currently logged in user's SessionId
     * as a query param, not by including the UserId in the endpoint path. Ex:
     * PUT /PEPSecure/api/v1/Users/?SessionId={string}
     * @template K
     * @param {string} id
     * @param {K} modelName
     * @param {DS.Snapshot<K>} snapshot
     * @returns {string}
     */
    urlForUpdateRecord<K extends string | number>(id: string, modelName: K, snapshot: DS.Snapshot<K>) {
        let url = super.urlForFindRecord(id, modelName, snapshot);

        url = url.replace(`/${id}`, '');

        if (this.session.isAuthenticated) {
            const { SessionId } = this.session.data.authenticated;
            url += `?${serializeQueryParams({ SessionId })}`;
        }

        return url;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        user: UserAdapter;
    }
}
