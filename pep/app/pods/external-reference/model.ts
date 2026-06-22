import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class ExternalReference extends DS.Model {
    @attr('string') extRefId!: string;
    @attr('string') extRefTitle!: string;
    @attr('string') extRefUrl!: string;
    @attr('number') relevanceScore!: number;
    @attr('number') publicationYear!: number;
    @attr('string') authors!: string;
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        externalReference: ExternalReference;
    }
}
