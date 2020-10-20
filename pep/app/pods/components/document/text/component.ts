import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { DS } from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import { DOCUMENT_IMG_BASE_URL } from 'pep/constants/documents';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import AjaxService from 'pep/services/ajax';
import LoadingBarService from 'pep/services/loading-bar';
import { parseXML } from 'pep/utils/dom';

interface DocumentTextArgs {
    text: string;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
}

export default class DocumentText extends Component<DocumentTextArgs> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service ajax!: AjaxService;

    @tracked xml?: XMLDocument;

    constructor(owner: unknown, args: DocumentTextArgs) {
        super(owner, args);
        this.parseDocumentText(args.text);
    }

    loadXLTS() {
        let request = new XMLHttpRequest();
        request.open('GET', '/xmlToHtml.xslt', false);
        request.send('');
        return request.responseXML;
    }

    @dontRunInFastboot
    async parseDocumentText(text: string) {
        const xml = parseXML(text);

        if (!(xml instanceof Error)) {
            const xlts = await this.loadXLTS();

            if (xlts && document.implementation && document.implementation.createDocument) {
                const processor = new XSLTProcessor();
                processor.setParameter(null, 'imageUrl', DOCUMENT_IMG_BASE_URL);
                processor.importStylesheet(xlts);
                const transformedDocument = (processor.transformToFragment(xml, document) as unknown) as XMLDocument;
                this.addImages(transformedDocument);
                this.xml = transformedDocument;
            }
        } else {
            this.notifications.error(this.intl.t('document.text.error'));
        }
    }

    addImages(document: XMLDocument) {}

    get text() {
        // const xmlimages = this.args.text.getElementsByTagName('image');
        return this.args.text;
    }

    @action
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        const attributes = target.attributes;
        const type = attributes.getNamedItem('type')?.nodeValue || attributes.getNamedItem('data-type')?.nodeValue;
        if (type === 'TERM2') {
            const rx = attributes.getNamedItem('rx')?.nodeValue;
            const groupName = attributes.getNamedItem('data-grpname')?.nodeValue;
            if (rx) {
                const id = rx.split('.');
                this.viewGlossaryTerm(target.innerText, id[id.length - 1]);
            } else if (groupName) {
                this.viewGlossaryTerm(groupName);
            }
        }
    }

    /**
     * Open the glossary modal to view the term definition and information
     *
     * @param {string} term
     * @memberof PageSidebarWidgetsGlossaryTerms
     */
    @action
    async viewGlossaryTerm(term: string, id?: string) {
        try {
            this.loadingBar.show();
            const results = await this.store.query('glossary-term', {
                termidtype: id ? 'ID' : 'Name',
                termIdentifier: id ? id : term
            });
            this.args.onGlossaryItemClick(term, results.toArray());
        } catch (error) {
            throw error;
        } finally {
            this.loadingBar.hide();
        }
    }
}
