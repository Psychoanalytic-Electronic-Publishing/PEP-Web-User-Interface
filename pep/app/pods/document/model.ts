import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Document extends DS.Model {
    @attr('string') PEPCode!: string;
    @attr('string') abstract!: string;
    @attr('string') accessClassification!: string;
    @attr('boolean') accessLimited!: boolean;
    @attr('string') accessLimitedDescription!: string;
    @attr('string') authorMast!: string;
    @attr('number') docLevel!: number;
    @attr('string') docType!: string;
    @attr('string') document!: string;
    @attr('string') documentInfoXML!: string;
    @attr('string') documentMetaXML!: string;
    @attr('string') documentRef!: string;
    @attr('string') documentRefHTML!: string;
    @attr('string') doi!: string;
    @attr('string') issn!: string;
    @attr('string') issue!: string;
    @attr('string') kwic!: string;
    @attr() kwicList!: string[];
    @attr('string') lang!: string;
    @attr('string') newSectionName!: string;
    @attr('string') origrx!: string;
    @attr('string') pgEnd!: string;
    @attr('string') pgRg!: string;
    @attr('string') pgStart!: string;
    @attr('string') rank!: number;
    @attr('string') relatedrx!: string;
    @attr('string') score!: number;
    @attr('string') sourceTitle!: string;
    @attr('string') sourceType!: string;
    @attr() stat!: object;
    @attr('string') title!: string;
    @attr('date') updated!: Date;
    @attr('string') vol!: string;
    @attr('string') year!: string;
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        document: Document;
    }
}
