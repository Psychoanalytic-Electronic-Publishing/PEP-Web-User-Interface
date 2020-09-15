import { classify } from '@ember/string';
import { pluralize } from 'ember-inflector';

import ENV from 'pep/config/environment';
import ApplicationAdapter from 'pep/pods/application/adapter';

export default class GlossaryTerm extends ApplicationAdapter {
    namespace = `${ENV.apiNamespace}/Documents`;

    /**
     * Customize the default model endpoint path
     * The endpoint for individual abstracts is /v2/Documents/Abstracts/{id}/
     * @param {String} modelName
     */
    pathForType() {
        return 'Glossary';
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        'glossary-term': GlossaryTerm;
    }
}
