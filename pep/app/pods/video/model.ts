import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Video extends DS.Model {
    @attr('string') abbrev!: string;
    @attr('string') bannerURL!: string;
    @attr('string') displayTitle!: string;
    @attr('string') embargoYears!: string;
    @attr('string') ISSN!: string;
    @attr('string') language!: string;
    @attr('string') PEPCode!: string;
    @attr('string') srcTitle!: string;
    @attr('string') sourceType!: string;
    @attr('string') title!: string;
    @attr('string') yearFirst!: string;
    @attr('string') yearLast!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        video: Video;
    }
}
