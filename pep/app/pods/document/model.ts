import { isEmpty } from '@ember/utils';

import DS from 'ember-data';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

import {
    HTML_BODY_REGEX,
    INVALID_ABSTRACT_PREVIEW_TAGS,
    INVALID_ABSTRACT_TAGS,
    SEARCH_STRING_REGEX,
    SEARCH_STRING_TERMS_REGEX,
} from 'pep/constants/regex';
import SimilarityMatch from 'pep/pods/similarity-match/model';

export default class Document extends DS.Model {
    // attributes
    @attr('string') abstract!: string;
    @attr('string') accessClassification!: string;
    @attr('string') accessChecked!: boolean;
    @attr('boolean') accessLimited!: boolean;
    @attr('boolean') accessLimitedCurrentContent!: boolean;
    @attr('string') accessLimitedDescription!: string;
    @attr('string') accessLimitedPubLink!: string;
    @attr('string') accessLimitedReason!: string;
    @attr('string') authorMast!: string;
    @attr('number') docLevel!: number;
    @attr('string') docType!: string;
    @attr('string') document!: string;
    @attr('string') documentInfoXML!: string;
    @attr('string') documentMetaXML!: string;
    @attr('string') documentRef!: string;
    @attr('string') documentRefHTML!: string;
    @attr('string') doi!: string;
    @attr('boolean') downloads!: boolean;
    @attr('string') issn!: string;
    @attr('string') issue!: string;
    @attr('string') issueTitle!: string;
    @attr('string') lang!: string;
    @attr('string') newSectionName!: string;
    @attr('string') origrx!: string;
    @attr('string') PEPCode!: string;
    @attr('boolean') pdfOriginalAvailable!: boolean;
    @attr('string') pgEnd!: string;
    @attr('string') pgRg!: string;
    @attr('string') pgStart!: string;
    @attr('string') rank!: number; // TODO if this is a search-only attr, move to SearchDocument
    @attr('string') rankField!: string; // TODO if this is a search-only attr, move to SearchDocument
    @attr('string') relatedrx!: string;
    @attr('string') score!: number; // TODO if this is a search-only attr, move to SearchDocument
    @attr('string') sourceNext!: string;
    @attr('string') sourcePrevious!: string;
    @attr('string') sourceTitle!: string;
    @attr('string') sourceType!: string;
    @attr() stat!: object;
    @attr('string') term!: string;
    @attr('number') termCount!: number;
    @attr('string') title!: string;
    @attr('date') updated!: Date;
    @attr('string') vol!: string;
    @attr('string') year!: string;

    // Doing this to allow metadata on find record calls - which ember data currently doesn't handle
    // properly
    @attr() meta!: any;

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

    get noAccessMessage() {
        return this.accessLimitedReason || this.accessLimitedDescription;
    }

    get searchTerm() {
        const terms = this.term.match(SEARCH_STRING_REGEX);
        const term = terms?.reduce((prev, next) => {
            if (next) {
                const term = next.replace(SEARCH_STRING_TERMS_REGEX, '');
                if (prev) {
                    prev += `/${term}`;
                } else {
                    prev = term;
                }
            }
            return prev;
        }, '');
        return term;
    }

    get canDownload() {
        return this.downloads && !this.accessLimited;
    }

    /**
     * Relationship
     *
     * @type {SimilarityMatch}
     * @memberof Document
     */
    @belongsTo('similarityMatch', { async: false }) similarityMatch!: SimilarityMatch | null;
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        document: Document;
    }
}
