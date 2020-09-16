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

    // TODO we should consider using the XML return format for documents instead of the HTML format
    // for more control and render safety with the returned content, however will probably require
    // more work to render/style initially (e.g. handing embedded videos)

    // From the functional requirements doc:
    // Requesting full document return data in XML from OPAS will give the most control for the client
    // formatting, in addition to providing faster data return. The XML return format from OPAS follows
    // the PEP-Web pepkbd3 DTD.

    // computeds
    get abstractCleaned() {
        //TODO needs to be be improved, possibly use something like ember-purify
        //(though DOMPurify may not be workabout in Fastboot)
        const abstract = !isEmpty(this.abstract) ? this.abstract.replace(/\s+/g, ' ') : '';
        return abstract.replace(INVALID_ABSTRACT_TAGS, '');
    }

    get abstractPreview() {
        //TODO needs to be be improved, possibly use something like ember-purify
        //(though DOMPurify may not be workabout in Fastboot)
        const abstract = !isEmpty(this.abstract) ? this.abstract.replace(/\s+/g, ' ') : '';
        return abstract.replace(INVALID_ABSTRACT_PREVIEW_TAGS, '');
    }

    get documentCleaned() {
        //TODO needs to be be improved, possibly use something like ember-purify
        //(though DOMPurify may not be workabout in Fastboot)
        const document = !isEmpty(this.document) ? this.document : '';
        return document.replace(HTML_BODY_REGEX, '$1');
    }

    /**
     * Relationship
     *
     * @type {SimilarityMatch}
     * @memberof Document
     */
    @belongsTo('similarityMatch', { async: false }) similarityMatch!: SimilarityMatch;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'glossary-term': GlossaryTerm;
    }
}
