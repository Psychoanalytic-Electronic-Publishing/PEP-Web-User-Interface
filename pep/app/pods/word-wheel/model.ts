import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class WordWheel extends DS.Model {
    // attributes
    @attr('string') field!: string;
    @attr('string') term!: string;
    @attr('number') termCount!: number;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'word-wheel': WordWheel;
    }
}
