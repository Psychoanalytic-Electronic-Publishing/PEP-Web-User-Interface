import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Biblio extends DS.Model {
    @attr('string') refText!: string;
    @attr('string') refLocalId!: string;
    @attr('string') refRx!: string;
    @attr('string') refRxcf!: string;
    @attr('string') refDoi!: string;
    @attr('string') refLinkSource!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        biblio: Biblio;
    }
}
