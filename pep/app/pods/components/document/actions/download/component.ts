import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { DOCUMENT_EPUB_BASE_URL, DOCUMENT_PDF_BASE_URL, DOCUMENT_PDFORIG_BASE_URL } from 'pep/constants/documents';
import ExportsService from 'pep/services/exports';
import PepSessionService from 'pep/services/pep-session';

interface DocumentActionsDownloadArgs {
    id: string;
}

export default class DocumentActionsDownload extends Component<DocumentActionsDownloadArgs> {
    @service('pep-session') session!: PepSessionService;
    @service exports!: ExportsService;

    get downloadUrlEpub() {
        return `${DOCUMENT_EPUB_BASE_URL}/${this.args.id}`;
    }

    get downloadUrlPdf() {
        return `${DOCUMENT_PDF_BASE_URL}/${this.args.id}`;
    }

    get downloadUrlPdfOrig() {
        return `${DOCUMENT_PDFORIG_BASE_URL}/${this.args.id}`;
    }

    /**
     * Download the document
     *
     * @param {string} url
     * @memberof DocumentActionsDownload
     */
    @action
    async downloadDocument(url: string) {
        this.exports.downloadItem(`${url}?${this.session.downloadAuthParams}`, 'Document');
    }
}
