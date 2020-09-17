import { classify } from '@ember/string';
import { pluralize } from 'ember-inflector';

import ApplicationAdapter from 'pep/pods/application/adapter';
import ENV from 'pep/config/environment';

export default class UserAdapter extends ApplicationAdapter {
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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        user: UserAdapter;
    }
}
