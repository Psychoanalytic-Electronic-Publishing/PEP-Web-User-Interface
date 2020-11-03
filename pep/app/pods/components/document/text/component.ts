import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
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
import { SearchTermId } from 'pep/constants/search';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import LoadingBarService from 'pep/services/loading-bar';
import ThemeService from 'pep/services/theme';
import { parseXML } from 'pep/utils/dom';
import tippy from 'tippy.js';

interface DocumentTextArgs {
    document: Document;
    searchTerm: string;
    page?: string;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
    viewSearch: (searchTerms: string) => void;
}

export default class DocumentText extends Component<DocumentTextArgs> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service theme!: ThemeService;
    @service router!: RouterService;

    @tracked xml?: XMLDocument;
    containerElement?: HTMLElement;

    constructor(owner: unknown, args: DocumentTextArgs) {
        super(owner, args);
        this.parseDocumentText(
            args.document.accessLimited ? args.document.abstractCleaned : args.document.documentCleaned
        );
    }

    /**
     * Load the XSLT doc to do the parsing of the xml
     *
     * @return {*}
     * @memberof DocumentText
     */
    loadXSLT() {
        let request = new XMLHttpRequest();
        request.open('GET', `${ENV.assetBaseUrl}xmlToHtml.xslt`, false);
        request.send('');
        return request.responseXML;
    }

    /**
     * Parse the document text to transform it to an xml document
     *
     * @param {string} text
     * @memberof DocumentText
     */
    @dontRunInFastboot
    async parseDocumentText(text: string) {
        const xml = parseXML(text);

        if (!(xml instanceof Error)) {
            const xslt = await this.loadXSLT();

            if (xslt && document.implementation && document.implementation.createDocument) {
                const processor = new XSLTProcessor();
                processor.setParameter('', 'searchTerm', this.args.searchTerm);
                processor.setParameter('', 'journalName', this.args.document.sourceTitle);
                processor.setParameter('', 'imageUrl', DOCUMENT_IMG_BASE_URL);
                processor.importStylesheet(xslt);
                const transformedDocument = (processor.transformToFragment(xml, document) as unknown) as XMLDocument;
                this.xml = transformedDocument;
            }
        } else {
            this.notifications.error(this.intl.t('document.text.error'));
        }
    }

    /**
     * Convert the xml doc back to a string for display
     *
     * @readonly
     * @memberof DocumentText
     */
    get text() {
        if (this.xml) {
            var s = new XMLSerializer();
            return s.serializeToString(this.xml);
        } else {
            return '';
        }
    }

    /**
     * Document click handler. There are many things you can do with a document on click so we decipher what element the user is clicking on and based upon a data attribute type we do the correct thing
     *
     * @param {Event} event
     * @memberof DocumentText
     */
    @action
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        const attributes = target.attributes;
        const type = attributes.getNamedItem('type')?.nodeValue || attributes.getNamedItem('data-type')?.nodeValue;

        if (target.tagName !== 'SUMMARY' && type !== 'web-link') {
            event.preventDefault();
        }
        if (type === 'TERM2') {
            const docId = attributes.getNamedItem('data-doc-id')?.nodeValue;
            const groupName = attributes.getNamedItem('data-grpname')?.nodeValue;
            if (docId) {
                const id = docId.split('.');
                this.viewGlossaryTerm(target.innerText, id[id.length - 1]);
            } else if (groupName) {
                this.viewGlossaryTerm(groupName);
            }
        } else if (type === 'BIBX') {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('read.document', id);
            }
        } else if (type === 'document-link') {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('read.document', id);
            }
        } else if (type === 'pagelink') {
            const reference = attributes.getNamedItem('data-r')?.nodeValue;
            const referenceArray = reference?.split(/\.(?=[^\.]+$)/) ?? [];
            const documentId = referenceArray[0];
            const apiPage = referenceArray[1];
            const page = parseInt(apiPage.substring(1), 10);
            if (documentId === this.args.document.id) {
                //scroll to page number
                this.scrollToPage(page);
            } else {
                //transition to a different document with a specific page
                this.router.transitionTo('read.document', documentId, {
                    queryParams: {
                        page
                    }
                });
            }
        } else if (type === 'figure' || type === 'table-figure') {
            const url = target?.getAttribute('src');
            const parent = target.parentElement?.parentElement;
            const caption = parent?.querySelector('.caption')?.innerHTML;
            this.modal.open('document/image', {
                url,
                caption
            });
        } else if (type === 'figure-id') {
            const figureId = attributes.getNamedItem('data-figure-id')?.nodeValue;
            const figure = this.containerElement?.querySelector(`#${figureId}`);
            const image = figure?.querySelector('img');
            const url = image?.getAttribute('src');
            const caption = figure?.querySelector('.caption')?.innerHTML;
            this.modal.open('document/image', {
                url,
                caption,
                id: parseInt(figureId?.substring(1) ?? '', 10)
            });
        } else if (type === 'search-author') {
            const firstName = target?.querySelector('.nfirst')?.innerHTML;
            const lastName = target?.querySelector('.nlast')?.innerHTML;
            const name = `${firstName} ${lastName}`;
            this.args.viewSearch(JSON.stringify([{ term: name, type: SearchTermId.AUTHOR, value: name }]));
        }
    }

    /**
     * Scroll to a specific page in the document (by scrolling to a specific page element)
     *
     * @param {number} page
     * @memberof DocumentText
     */
    scrollToPage(page: number) {
        const element = this.containerElement?.querySelector(`[data-page-start='${page}']`);
        element?.scrollIntoView();
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
            const parsedTerm = term.split(';');
            const results = await this.store.query('glossary-term', {
                termidtype: id ? 'ID' : 'Name',
                termIdentifier: id ? id : parsedTerm[0]
            });
            this.args.onGlossaryItemClick(parsedTerm[0], [...new Set(results.toArray())]);
        } catch (error) {
            throw error;
        } finally {
            this.loadingBar.hide();
        }
    }

    /**
     * Parse the document on change of the text
     *
     * @memberof DocumentText
     */
    @action
    parseDocument() {
        this.parseDocumentText(
            this.args.document.accessLimited ? this.args.document.abstractCleaned : this.args.document.documentCleaned
        );
    }

    /**
     * set up the tooltips and if we get passed in a page number - scroll to it
     *
     * @param {HTMLElement} element
     * @memberof DocumentText
     */
    @action
    setupListeners(element: HTMLElement) {
        this.containerElement = element;
        scheduleOnce('afterRender', this, this.attachTooltips);
        if (this.args.page) {
            this.scrollToPage(parseInt(this.args.page, 10));
        }
    }

    /**
     * Attach the tooltips to the elements and provide what text/html they will show
     *
     * @memberof DocumentText
     */
    attachTooltips() {
        const tippyTrigger = 'mouseenter focus click';
        const elements = this.containerElement?.querySelectorAll('.bibtip');
        elements?.forEach((item) => {
            const id = item.attributes.getNamedItem('data-element')?.nodeValue;
            const node = this.containerElement?.querySelector(`#${id}`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    theme: 'light',
                    allowHTML: true,
                    interactive: true,
                    trigger: tippyTrigger,
                    onClickOutside(instance) {
                        instance.hide();
                    }
                });
            }
        });

        const authorTooltips = this.containerElement?.querySelectorAll('.newauthortip');
        authorTooltips?.forEach((item) => {
            const node = this.containerElement?.querySelector(`.peppopuptext`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    theme: 'light',
                    allowHTML: true,
                    interactive: true,
                    trigger: tippyTrigger,
                    placement: 'right',
                    onClickOutside(instance) {
                        instance.hide();
                    }
                });
            }
        });

        const relatedBibliographies = this.containerElement?.querySelectorAll('.bibx-related-info');
        relatedBibliographies?.forEach((item) => {
            tippy(item, {
                allowHTML: true,
                content: this.intl.t('document.text.relatedBibliography'),
                theme: 'light',
                trigger: tippyTrigger,
                onClickOutside(instance) {
                    instance.hide();
                }
            });
        });
    }
}
