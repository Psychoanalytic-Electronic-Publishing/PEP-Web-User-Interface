import Document from 'pep/pods/document/model';

export default class Abstract extends Document {}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        abstract: Abstract;
    }
}
