import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class WhatsNew extends DS.Model {
    // attributes
    @attr('string') PEPCode!: string;
    @attr('string') abbrev!: string;
    @attr('string') displayTitle!: string;
    @attr('string') issue!: string;
    @attr('string') srcTitle!: string;
    @attr('date') updated!: Date;
    @attr('string') volume!: string;
    @attr('string') year!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'whats-new': WhatsNew;
    }
}
