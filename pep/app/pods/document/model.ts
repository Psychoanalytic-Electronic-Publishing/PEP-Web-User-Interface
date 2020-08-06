import DS from 'ember-data';
import attr from 'ember-data/attr';
import { isEmpty } from '@ember/utils';

const HTML_BODY_REGEX = /^.*?<body[^>]*>(.*?)<\/body>.*?$/i;
const INVALID_ABSTRACT_TAGS = /(<\!DOCTYPE html>|<\/?html>|<\/?body>|<head>.*<\/head>)/gim;

export default class Document extends DS.Model {
    // attributes
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

    // computeds
    get abstractCleaned() {
        //TODO needs to be be improved, possibly use something like ember-purify
        //(though DOMPurify may not be workabout in Fastboot)
        const abstract = !isEmpty(this.abstract) ? this.abstract.replace(/\s+/g, ' ') : '';
        return abstract.replace(INVALID_ABSTRACT_TAGS, '');
    }

    get documentCleaned() {
        //TODO needs to be be improved, possibly use something like ember-purify
        //(though DOMPurify may not be workabout in Fastboot)
        const document = !isEmpty(this.document) ? this.document : '';
        return document.replace(HTML_BODY_REGEX, '$1');
    }
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        document: Document;
    }
}
