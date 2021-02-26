import DS from 'ember-data';

import ENV from 'pep/config/environment';
import ApplicationAdapter from 'pep/pods/application/adapter';

export default class Configuration extends ApplicationAdapter {
    namespace = `${ENV.apiNamespace}/Client`;

    /**
     *
     *
     * @template K
     * @param {string} id
     * @param {K} modelName
     * @param {DS.Snapshot<K>} snapshot
     * @return {*}
     * @memberof Configuration
     */
    urlForUpdateRecord<K extends string | number>(id: string, modelName: K, snapshot: DS.Snapshot<K>) {
        const url = super.urlForUpdateRecord(id, modelName, snapshot);
        const updatedUrl = url.replace(`/${id}`, '');
        return updatedUrl;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        configuration: Configuration;
    }
}
