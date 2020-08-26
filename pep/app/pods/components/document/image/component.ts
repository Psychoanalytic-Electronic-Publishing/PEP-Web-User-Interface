import Component from '@glimmer/component';

import { DOCUMENT_IMG_BASE_URL } from 'pep/constants/documents';

interface DocumentImageArgs {
    id: string;
}

export default class DocumentImage extends Component<DocumentImageArgs> {
    get src() {
        return `${DOCUMENT_IMG_BASE_URL}/${this.args.id}/`;
    }
}
