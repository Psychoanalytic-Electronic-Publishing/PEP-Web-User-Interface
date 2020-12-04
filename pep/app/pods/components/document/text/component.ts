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

import animateScrollTo from 'animated-scroll-to';
import ENV from 'pep/config/environment';
import { DOCUMENT_IMG_BASE_URL } from 'pep/constants/documents';
import {
    HIT_MARKER_END, HIT_MARKER_END_OUTPUT_HTML, HIT_MARKER_START, HIT_MARKER_START_OUTPUT_HTML, SEARCH_HIT_MARKER_REGEX,
    SearchTermId
} from 'pep/constants/search';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import ThemeService from 'pep/services/theme';
import { buildJumpToHitsHTML, loadXSLT, parseXML } from 'pep/utils/dom';
import tippy, { Instance, Props } from 'tippy.js';

interface DocumentTextArgs {
    document: Document;
    target?: 'abstract' | 'document';
    offsetForScroll?: number;
    readQueryParams: {
        q: string;
        searchTerms: string | null;
        facets: string | null;
        matchSynonyms: boolean;
    };
    page?: string;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
    viewSearch: (searchTerms: string) => void;
}

/**
 *  The types of links in a document - these come from a type data attribute
 *
 * @export
 * @enum {number}
 */
export enum DocumentLinkTypes {
    GLOSSARY_TERM = 'TERM2',
    BIBLIOGRAPHY = 'BIBX',
    DOCUMENT = 'document-link',
    PAGE = 'pagelink',
    FIGURE = 'figure',
    TABLE_FIGURE = 'table-figure',
    FIGURE_WITH_ID = 'figure-id',
    AUTHOR_SEARCH = 'search-author',
    WEB = 'web-link',
    DOI = 'doi',
    SEARCH_HIT_ARROW = 'search-hit-arrow',
    SEARCH_HIT_TEXT = 'search-hit-text'
}

/**
 * The selectors for attaching tooltips
 *
 * @export
 * @enum {number}
 */
export enum DocumentTooltipSelectors {
    BIBLIOGRAPHY = '.bibtip',
    BIBLIOGRAPHY_RELATED_INFO = '.bibx-related-info',
    NEW_AUTHOR = '.newauthortip',
    FOOTNOTE = '.ftnx'
}
export default class DocumentText extends Component<DocumentTextArgs> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service theme!: ThemeService;
    @service router!: RouterService;
    @service('pep-session') session!: PepSessionService;

    @tracked xml?: XMLDocument;

    containerElement?: HTMLElement;
    scrollableElement?: Element | null;
    defaultOffsetForScroll = -70;

    tippyOptions = {
        theme: 'light',
        allowHTML: true,
        interactive: true,
        trigger: 'mouseenter focus click',
        onClickOutside(instance: Instance<Props>) {
            instance.hide();
        }
    };

    constructor(owner: unknown, args: DocumentTextArgs) {
        super(owner, args);
        const target = args.target ?? (args.document.accessLimited ? 'abstract' : 'document');
        const text = args.document[target];
        this.parseDocumentText(text);
    }

    private get scrollOffset() {
        return this.args.offsetForScroll ?? this.defaultOffsetForScroll;
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
            const xslt = await loadXSLT();

            if (xslt && document.implementation && document.implementation.createDocument) {
                const processor = new XSLTProcessor();
                if (this.session.isAuthenticated) {
                    processor.setParameter('', 'sessionId', this.session.data.authenticated.SessionId);
                }
                processor.setParameter('', 'clientId', ENV.clientId);
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
            return this.replaceHitMarkerText(s.serializeToString(this.xml));
        } else {
            return '';
        }
    }

    /**
     * Find and replace all search hit marker text with the correct html
     *
     * @param {string} text
     * @return {string}
     * @memberof DocumentText
     */
    replaceHitMarkerText(text: string) {
        let anchorCount = 0;
        let regex = SEARCH_HIT_MARKER_REGEX;
        let totalAnchorCount = text.match(new RegExp(HIT_MARKER_START, 'g'))?.length ?? 1;
        return text.replace(regex, (match: string) => {
            const { previous, next } = buildJumpToHitsHTML(anchorCount);
            if (match === HIT_MARKER_START) {
                anchorCount += 1;
                if (anchorCount > 1) {
                    return `<span data-hit-number='${anchorCount}' class='hit'>${previous}${HIT_MARKER_START_OUTPUT_HTML}`;
                } else if (anchorCount <= 1) {
                    return `<span data-hit-number='${anchorCount}' class='hit'>${HIT_MARKER_START_OUTPUT_HTML}`;
                } else {
                    return '';
                }
            } else if (match === HIT_MARKER_END) {
                return `${HIT_MARKER_END_OUTPUT_HTML}${anchorCount < totalAnchorCount ? next : ''}</span>`;
            } else {
                return match;
            }
        });
    }

    /**
     * Document click handler. There are many things you can do with a document on click so we decipher what element the user is clicking on and
     * based upon a data attribute type we do the correct thing.
     *
     * TODO - try to improve this method and split up into helper functions
     *
     * @param {Event} event
     * @memberof DocumentText
     */
    @action
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        const attributes = target.attributes;
        const type = this.getNodeType(target);
        if (target.tagName !== 'SUMMARY' && type !== DocumentLinkTypes.WEB && type !== DocumentLinkTypes.DOI) {
            event.preventDefault();
        }
        if (type === DocumentLinkTypes.GLOSSARY_TERM) {
            this.viewGlossaryTermFromElement(target);
        } else if (type === DocumentLinkTypes.BIBLIOGRAPHY) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('read.document', id, {
                    queryParams: this.args.readQueryParams
                });
            }
        } else if (type === DocumentLinkTypes.DOCUMENT) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('read.document', id, {
                    queryParams: this.args.readQueryParams
                });
            }
        } else if (type === DocumentLinkTypes.PAGE) {
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
                        ...this.args.readQueryParams,
                        page
                    }
                });
            }
        } else if (type === DocumentLinkTypes.FIGURE || type === DocumentLinkTypes.TABLE_FIGURE) {
            const url = target?.getAttribute('src');
            const parent = target.parentElement?.parentElement;
            const caption = parent?.querySelector('.caption')?.innerHTML;
            this.modal.open('document/image', {
                url,
                caption
            });
        } else if (type === DocumentLinkTypes.FIGURE_WITH_ID) {
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
        } else if (type === DocumentLinkTypes.AUTHOR_SEARCH) {
            const firstName = target?.querySelector('.nfirst')?.innerHTML;
            const lastName = target?.querySelector('.nlast')?.innerHTML;
            const name = `${firstName} ${lastName}`;
            this.args.viewSearch(JSON.stringify([{ term: name, type: SearchTermId.AUTHOR, value: name }]));
        } else if (type === DocumentLinkTypes.SEARCH_HIT_TEXT) {
            const possibleTermNode = target.parentElement?.parentElement;
            if (possibleTermNode) {
                const type = this.getNodeType(possibleTermNode);
                if (type === DocumentLinkTypes.GLOSSARY_TERM) {
                    this.viewGlossaryTermFromElement(possibleTermNode);
                }
            }
        } else if (type === DocumentLinkTypes.SEARCH_HIT_ARROW) {
            const selectedNode = this.containerElement?.querySelector(`.search-hit-selected`);
            if (selectedNode) {
                selectedNode?.classList.remove('search-hit-selected');
            }
            const targetSearchHit = attributes.getNamedItem('data-target-search-hit')?.nodeValue;
            if (targetSearchHit) {
                this.scrollToSearchHit(targetSearchHit);
            }
        }
    }

    /**
     * Try to get the target nodes type from either `type` or `data-type`
     *
     * @param {HTMLElement} target
     * @return {*}
     * @memberof DocumentText
     */
    getNodeType(target: HTMLElement) {
        const attributes = target.attributes;
        const type =
            (attributes.getNamedItem('type')?.nodeValue as DocumentLinkTypes) ||
            (attributes.getNamedItem('data-type')?.nodeValue as DocumentLinkTypes);
        return type;
    }

    /**
     * Hanlder for passing in an element and viewing a glossary term
     *
     * @param {HTMLElement} element
     * @memberof DocumentText
     */
    viewGlossaryTermFromElement(element: HTMLElement) {
        const attributes = element.attributes;
        const docId = attributes.getNamedItem('data-doc-id')?.nodeValue;
        const groupName = attributes.getNamedItem('data-grpname')?.nodeValue;
        if (docId) {
            const id = docId.split('.');
            this.viewGlossaryTerm(element.innerText, id[id.length - 1]);
        } else if (groupName) {
            this.viewGlossaryTerm(groupName);
        }
    }

    /**
     * Scroll to a specific search hit in the document
     *
     * @param {number} page
     * @memberof DocumentText
     */
    async scrollToSearchHit(hitNumber: string) {
        const element = this.containerElement?.querySelector(`[data-hit-number='${hitNumber}']`);
        await this.animateScrollToElement(element);
        element?.classList.add('search-hit-selected');
    }

    /**
     * Scroll to a specific page in the document (by scrolling to a specific page element)
     *
     * @param {number} page
     * @memberof DocumentText
     */
    scrollToPage(page: number) {
        const element = this.containerElement?.querySelector(`[data-page-start='${page}']`);
        this.animateScrollToElement(element);
    }

    /**
     * Animated the scroll to an element using a specified vertical offset
     *
     * @param {(Element | null)} [element]
     * @memberof DocumentText
     */
    animateScrollToElement(element?: Element | null) {
        const container = this.scrollableElement;
        if (element && container) {
            return animateScrollTo(element, {
                verticalOffset: this.scrollOffset,
                elementToScroll: container
            });
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
        const target = this.args.target ?? (this.args.document.accessLimited ? 'abstract' : 'document');
        const text = this.args.document[target];
        this.parseDocumentText(text);
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
        this.scrollableElement = this.containerElement?.closest('.page-content-inner');
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
        const elements = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.BIBLIOGRAPHY);
        elements?.forEach((item) => {
            const id = item.attributes.getNamedItem('data-element')?.nodeValue;
            const node = this.containerElement?.querySelector(`#${id}`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    ...this.tippyOptions
                });
            }
        });

        const authorTooltips = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.NEW_AUTHOR);
        authorTooltips?.forEach((item) => {
            const node = this.containerElement?.querySelector(`.peppopuptext`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    placement: 'right',
                    ...this.tippyOptions
                });
            }
        });

        const relatedBibliographies = this.containerElement?.querySelectorAll(
            DocumentTooltipSelectors.BIBLIOGRAPHY_RELATED_INFO
        );
        relatedBibliographies?.forEach((item) => {
            tippy(item, {
                content: this.intl.t('document.text.relatedBibliography'),
                ...this.tippyOptions
            });
        });

        const footnotes = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.FOOTNOTE);
        footnotes?.forEach((item) => {
            const id = item.attributes.getNamedItem('data-r')?.nodeValue;
            const node = this.containerElement?.querySelector(`#${id}`);
            const supParent = item.parentElement?.parentElement;
            if (node && supParent) {
                tippy(item, {
                    appendTo: supParent,
                    content: node.innerHTML,
                    ...this.tippyOptions
                });
            }
        });
    }
}
