import Component from '@glint/environment-ember-loose/glimmer-component';

import { DOCUMENT_IMG_BASE_URL } from 'pep/constants/documents';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface DocumentImageArgs {
    id: string;
}

export default class DocumentImage extends Component<BaseGlimmerSignature<DocumentImageArgs>> {
    get src() {
        return `${DOCUMENT_IMG_BASE_URL}/${this.args.id}/`;
    }
}
