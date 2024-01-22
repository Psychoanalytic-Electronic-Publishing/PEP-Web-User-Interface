import JSONSerializer from '@ember-data/serializer/json';
import Store from '@ember-data/store';
import Model from '@ember-data/model';

export default class BiblioSerializer extends JSONSerializer {
    normalizeResponse(
        store: Store,
        primaryModelClass: Model,
        payload: any,
        id: string | number | null,
        requestType: string
    ): any {
        if (id === null) return;

        payload = {
            id,
            data: payload.map((item: any) => ({
                type: 'biblio',
                attributes: {
                    refLocalId: item.ref_local_id,
                    refRx: item.ref_rx,
                    refRxcf: item.ref_rxcf
                }
            }))
        };

        return super.normalizeResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// TypeScript registry
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        biblio: BiblioSerializer;
    }
}
