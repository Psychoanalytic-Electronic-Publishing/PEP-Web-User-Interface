import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Volume extends DS.Model {
    @attr('string') PEPCode!: string;
    @attr('string') vol!: string;
    @attr('string') year!: string;
    @attr('string') count!: number;
    @attr() years!: [];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        volume: Volume;
    }
}
