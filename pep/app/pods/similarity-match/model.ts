import DS from 'ember-data';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import Document from 'pep/pods/document/model';

export default class SimilarityMatch extends DS.Model {
    @attr('number') similarMaxScore!: number;
    @attr('number') similarNumFound!: number;

    @hasMany('document', { async: false }) similarDocuments!: Document;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'similarity-match': SimilarityMatch;
    }
}
