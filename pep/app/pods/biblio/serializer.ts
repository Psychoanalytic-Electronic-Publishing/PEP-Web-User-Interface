import DS from 'ember-data';

export default class BiblioSerializer extends DS.JSONAPISerializer {
    keyForAttribute(attr: string) {
        return attr;
    }

    normalizeResponse(
        store: DS.Store,
        primaryModelClass: ModelWithName,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        const data = payload.map((item: any) => ({
            id: item.ref_local_id,
            type: primaryModelClass.modelName,
            attributes: {
                refText: item.ref_text,
                refLocalId: item.ref_local_id,
                refRx: item.ref_rx || null,
                refRxcf: item.ref_rxcf || null,
                refDoi: item.ref_doi || null,
                refLinkSource: item.ref_link_source || null
            }
        }));

        return super.normalizeResponse(store, primaryModelClass, { data }, id, requestType);
    }
}
