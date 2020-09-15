import DS from 'ember-data';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

import { isEmpty } from '@ember/utils';

import { INVALID_ABSTRACT_TAGS, INVALID_ABSTRACT_PREVIEW_TAGS, HTML_BODY_REGEX } from 'pep/constants/regex';
import SimilarityMatch from 'pep/pods/similarity-match/model';

export default class GlossaryTerm extends DS.Model {
    @attr('string') abstract!: string;
    @attr('string') accessClassification!: string;
    @attr('boolean') accessLimited!: boolean;
    @attr('boolean') accessLimitedCurrentContent!: boolean;
    @attr('string') accessLimitedDescription!: string;
    @attr('string') accessLimitedPubLink!: string;
    @attr('string') accessLimitedReason!: string;
    @attr('string') authorMast!: string;
    @attr('string') coreName!: string;
    @attr('string') documentId!: string;
    @attr('string') docType!: string;
    @attr('string') document!: string;
    @attr('string') documentRef!: string;
    @attr('string') documentRefHTML!: string;
    @attr('string') documentMetaXML!: string;
    @attr('string') documentInfoXML!: string;
    @attr('string') doi!: string;
    @attr('string') groupID!: string;
    @attr('string') groupName!: string;
    @attr('string') groupTermCount!: string;
    @attr('string') issn!: string;
    @attr('string') issue!: string;
    @attr('string') issueTitle!: string;
    @attr('string') lang!: string;
    @attr('string') kwic!: string;
    @attr() kwicList!: string[];
    @attr('string') newSectionName!: string;
    @attr('string') origrx!: string;
    @attr('string') PEPCode!: string;
    @attr('string') pgEnd!: string;
    @attr('string') pgRg!: string;
    @attr('string') pgStart!: string;
    @attr('string') rank!: number;
    @attr('string') rankField!: string;
    @attr('string') referenceCount!: string;
    @attr('string') relatedrx!: string;
    @attr('string') score!: number;
    @attr('string') sourceTitle!: string;
    @attr('string') sourceType!: string;
    @attr('string') term!: string;
    @attr('string') termCount!: string;
    @attr('string') termDefPartXML!: string;
    @attr('string') termDefRefXML!: string;
    @attr('string') termID!: string;
    @attr('string') termSource!: string;
    @attr('string') termType!: string;
    @attr('string') title!: string;
    @attr('string') vol!: string;
    @attr('string') year!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'glossary-term': GlossaryTerm;
    }
}
