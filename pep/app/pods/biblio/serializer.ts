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
        const data = payload.map((item: any) => {
            return {
                id: item.ref_local_id,
                type: primaryModelClass.modelName,
                attributes: {
                    refText: item.ref_text,
                    refLocalId: item.ref_local_id,
                    refRx: item.ref_rx || null,
                    refRxcf: item.ref_rxcf || null,
                    refExternal: item.ref_external
                        ? item.ref_external.map((external: any) => {
                              return {
                                  extRefId: external.ext_ref_id,
                                  extRefTitle: external.ext_ref_title,
                                  extRefUrl: external.ext_ref_url,
                                  relevanceScore: external.relevance_score,
                                  publicationYear: external.publication_year,
                                  authors: external.authors
                              };
                          })
                        : []
                }
            };
        });

        return super.normalizeResponse(store, primaryModelClass, { data }, id, requestType);
    }
}
