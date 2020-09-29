import DS from 'ember-data';

import ApplicationSerializerMixin from 'pep/mixins/application-serializer';

export default class SimilarityMatch extends ApplicationSerializerMixin(
    DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin)
) {
    attrs = {
        similarDocuments: { embedded: 'always' }
    };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'similarity-match': SimilarityMatch;
    }
}
