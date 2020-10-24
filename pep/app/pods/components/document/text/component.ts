import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { DS } from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import ENV from 'pep/config/environment';
import { DOCUMENT_IMG_BASE_URL } from 'pep/constants/documents';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import LoadingBarService from 'pep/services/loading-bar';
import ThemeService from 'pep/services/theme';
import { parseXML } from 'pep/utils/dom';
import tippy from 'tippy.js';

interface DocumentTextArgs {
    text: string;
    journalName: string;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
}

export default class DocumentText extends Component<DocumentTextArgs> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service theme!: ThemeService;

    @tracked xml?: XMLDocument;
    containerElement?: HTMLElement;

    constructor(owner: unknown, args: DocumentTextArgs) {
        super(owner, args);
        this.parseDocumentText(args.text);
    }

    loadXSLT() {
        let request = new XMLHttpRequest();
        request.open('GET', `${ENV.assetBaseUrl}xmlToHtml.xslt`, false);
        request.send('');
        return request.responseXML;
    }

    @dontRunInFastboot
    async parseDocumentText(text: string) {
        const xml = parseXML(text);

        if (!(xml instanceof Error)) {
            const xslt = await this.loadXSLT();

            if (xslt && document.implementation && document.implementation.createDocument) {
                const processor = new XSLTProcessor();
                processor.setParameter('', 'journalName', this.args.journalName);
                processor.setParameter('', 'imageUrl', DOCUMENT_IMG_BASE_URL);
                processor.importStylesheet(xslt);
                const transformedDocument = (processor.transformToFragment(xml, document) as unknown) as XMLDocument;
                this.xml = transformedDocument;
            }
        } else {
            this.notifications.error(this.intl.t('document.text.error'));
        }
    }

    get text() {
        if (this.xml) {
            var s = new XMLSerializer();
            return s.serializeToString(this.xml);
        } else {
            return '';
        }
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

    @action
    parseDocument() {
        this.parseDocumentText(this.args.text);
    }

    @action
    setupListeners(element: HTMLElement) {
        this.containerElement = element;
        scheduleOnce('afterRender', this, this.attachTooltips);
    }

    attachTooltips() {
        const elements = this.containerElement?.querySelectorAll('.bibtip');
        elements?.forEach((item) => {
            const id = item.attributes.getNamedItem('data-element')?.nodeValue;
            const node = this.containerElement?.querySelector(`#${id}`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    theme: 'light',
                    allowHTML: true
                });
            }
        });
    }
}
