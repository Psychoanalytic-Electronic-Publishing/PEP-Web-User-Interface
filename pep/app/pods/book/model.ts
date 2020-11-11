import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Book extends DS.Model {
    @attr('string') abbrev!: string;
    @attr('string') authors!: string;
    @attr('string') bannerURL!: string;
    @attr('string') bookCode!: string;
    @attr('string') displayTitle!: string;
    @attr('string') documentId!: string;
    @attr('string') embargoYears!: string;
    @attr('string') ISBN10!: string;
    @attr('string') ISBN13!: string;
    @attr('string') ISSN!: string;
    @attr('string') language!: string;
    @attr('string') PEPCode!: string;
    @attr('string') pub_year!: string;
    @attr('string') srcTitle!: string;
    @attr('string') sourceType!: string;
    @attr('string') title!: string;
    @attr('string') yearFirst!: string;
    @attr('string') yearLast!: string;
}
// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        book: Book;
    }
}
