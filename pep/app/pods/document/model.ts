import DS from 'ember-data';
// import attr from 'ember-data/attr';

export default class Document extends DS.Model {}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        document: Document;
    }
}
