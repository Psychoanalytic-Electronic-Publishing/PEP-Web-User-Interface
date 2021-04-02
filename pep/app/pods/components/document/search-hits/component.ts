import Component from '@glint/environment-ember-loose/glimmer-component';

import Document from 'pep/pods/document/model';

interface DocumentSearchHitsArgs {
    Args: {
        document: Document;
        searchHitNumber: number;
        viewNextSearchHit: () => void;
        viewPreviousSearchHit: () => void;
        viewHitNumber: () => void;
    };
}

export default class DocumentSearchHits extends Component<DocumentSearchHitsArgs> {
    /**
     * Show or hide left arrow for search hits
     *
     * @readonly
     * @memberof ReadDocument
     */
    get showPreviousSearchHitButton() {
        return this.args.searchHitNumber && this.args.searchHitNumber > 1;
    }

    /**
     * Show or hide right arrow for search hits
     *
     * @readonly
     * @memberof ReadDocument
     */
    get showNextSearchHitButton() {
        return (
            this.args.searchHitNumber === undefined || this.args.searchHitNumber < (this.args.document?.termCount ?? 0)
        );
    }
}
