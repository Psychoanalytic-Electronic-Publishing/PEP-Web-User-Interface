import { action, computed } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { next, run, scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import { DS } from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import ModalService from '@gavant/ember-modals/services/modal';

import animateScrollTo from 'animated-scroll-to';
import ENV from 'pep/config/environment';
import { DOCUMENT_IMG_BASE_URL, DocumentLinkTypes } from 'pep/constants/documents';
import {
    HIT_MARKER_END,
    HIT_MARKER_END_OUTPUT_HTML,
    HIT_MARKER_START,
    HIT_MARKER_START_OUTPUT_HTML,
    POSSIBLE_INVALID_SEARCH_HITS,
    SEARCH_HIT_MARKER_REGEX,
    SearchTermId,
    SourceType
} from 'pep/constants/search';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import { SearchQueryParams } from 'pep/pods/search/index/route';
import AjaxService from 'pep/services/ajax';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import ScrollableService from 'pep/services/scrollable';
import ThemeService from 'pep/services/theme';
import { buildJumpToHitsHTML, loadXSLT, parseXML } from 'pep/utils/dom';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { reject } from 'rsvp';
import tippy, { Instance, Props } from 'tippy.js';
import { arrow, link, tooltip } from './svg';

interface DocumentTextArgs {
    document: Document;
    target?: 'abstract' | 'document';
    scrollableServiceTarget?: string;
    offsetForScroll?: number;
    readQueryParams: {
        q: string;
        searchTerms: string | null;
        facets: string | null;
        matchSynonyms: boolean;
    };
    page?: string;
    searchHitNumber?: number;
    watermark?: boolean;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
    viewSearch: (searchTerms: SearchQueryParams) => void;
    documentRendered: () => void;
    viewablePageUpdate?: (page: string) => void;
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
    AUTHOR_TIP = '.authortip',
    FOOTNOTE = '.ftnx',
    TRANSLATION = '.translation',
    NOTE_TIP = '.notetip',
    TITTLE_HELP = '.art-title',
    BANNER_HELP = '.banner img',
    AUTHOR_HELP = '.author'
}

export type DocumentTippyInstance = Instance & {
    _isFetching: boolean;
    _loaded: boolean;
};

export default class DocumentText extends Component<BaseGlimmerSignature<DocumentTextArgs>> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service declare theme: ThemeService;
    @service router!: RouterService;
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;
    @service ajax!: AjaxService;
    @service scrollable!: ScrollableService;

    @tracked xml?: XMLDocument;
    @tracked visiblePages: string[] = [];
    @tracked pageTracking = false;

    containerElement?: HTMLElement;
    scrollableElement?: Element | null;
    scrollableServiceTarget?: string | null = this.args.scrollableServiceTarget;
    defaultOffsetForScroll = -95;
    tippyHelpDelay: [number, null] = [2000, null];

    tippyOptions = {
        theme: 'light',
        allowHTML: true,
        interactive: true,
        hideOnClick: false,
        trigger: 'mouseenter focus click',
        onClickOutside(instance: Instance<Props>) {
            instance.hide();
        }
    };

    private get scrollOffset() {
        return this.args.offsetForScroll ?? this.defaultOffsetForScroll;
    }

    @dontRunInFastboot
    async generateDocument(text: string) {
        const document = await this.parseDocumentText(text);
        if (document) {
            this.xml = document;
            next(this, this.documentRendered);
        }
    }

    async documentRendered() {
        run(() => {
            if (this.scrollableServiceTarget) {
                this.scrollable.scrollToTop(this.scrollableServiceTarget);
            }
        });

        run(async () => {
            this.args.documentRendered?.();

            if (this.args.page) {
                await this.scrollToPageOrTarget(this.args.page);
            }
            this.pageTracking = true;
        });
    }

    /**
     * Parse the document text to transform it to an xml document
     *
     * @param {string} text
     * @memberof DocumentText
     */

    async parseDocumentText(text: string, options?: { translationEnabled?: boolean }) {
        const xml = parseXML(text);

        if (!(xml instanceof Error)) {
            const xslt = await loadXSLT();

            if (xslt && document.implementation && document.implementation.createDocument) {
                const processor = new XSLTProcessor();
                if (this.session.isAuthenticated) {
                    processor.setParameter('', 'sessionId', this.session.data?.authenticated.SessionId);
                }
                processor.setParameter(
                    '',
                    'translationConcordanceEnabled',
                    options?.translationEnabled ?? this.currentUser.preferences?.translationConcordanceEnabled
                );
                processor.setParameter(
                    '',
                    'glossaryTermFormattingEnabled',
                    this.currentUser.preferences?.glossaryFormattingEnabled
                );
                processor.setParameter('', 'clientId', ENV.clientId);
                processor.setParameter('', 'journalName', this.args.document.sourceTitle);
                processor.setParameter('', 'imageUrl', DOCUMENT_IMG_BASE_URL);
                processor.setParameter('', 'isBook', this.args.document.sourceType === SourceType.BOOK);
                processor.importStylesheet(xslt);
                const transformedDocument = processor.transformToFragment(xml, document) as unknown as XMLDocument;
                return transformedDocument;
            }
            return reject(this.notifications.error(this.intl.t('document.text.error')));
        } else {
            return reject(this.notifications.error(this.intl.t('document.text.error')));
        }
    }

    /**
     * Convert the xml doc back to a string for display
     *
     * @readonly
     * @memberof DocumentText
     */
    @computed('xml')
    get text() {
        if (this.xml) {
            const s = new XMLSerializer();
            return this.replaceHitMarkerText(s.serializeToString(this.xml));
        } else {
            return '';
        }
    }

    /**
     * Find and replace all search hit marker text with the correct html
     * TODO: Possibly improve this to just call regex once instead of using a regex to fix issues, and then using a different regex to make html
     *
     * @param {string} text
     * @return {string}
     * @memberof DocumentText
     */
    replaceHitMarkerText(text: string): string {
        // First fix all issues of a search hit being mixed inside of another tag. This commonly happens when we have a glossary term inside a search hit
        const replacer = (match: string) => {
            if (!match.includes('@@@#')) {
                return `#@@@${match.replace('#@@@', '')}`;
            } else {
                return match;
            }
        };
        const fixedStr = text.replace(POSSIBLE_INVALID_SEARCH_HITS, replacer);

        // Now replace all search hit markers with the correct html
        let anchorCount = 0;
        const regex = SEARCH_HIT_MARKER_REGEX;
        const totalAnchorCount = fixedStr.match(new RegExp(HIT_MARKER_START, 'g'))?.length ?? 1;
        return fixedStr.replace(regex, (match: string) => {
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
        const eventTarget = event.target as HTMLElement;
        const attributes = eventTarget.attributes;
        let type = this.getNodeType(eventTarget);
        let target = eventTarget;
        // Safari will sometimes get a different target than chrome, so we try to find the closest data type or type data attribute and use that
        if (!type) {
            const dataTypeElement = eventTarget.querySelector('[data-type]') as HTMLElement;
            const typeElement = eventTarget.querySelector('[type]') as HTMLElement;
            if (dataTypeElement && typeElement) {
                type = this.getNodeType(dataTypeElement);
                target = dataTypeElement;
            } else if (dataTypeElement) {
                type = this.getNodeType(dataTypeElement);
                target = dataTypeElement;
            } else if (typeElement) {
                type = this.getNodeType(typeElement);
                target = typeElement;
            }
        }

        if (target.tagName !== 'SUMMARY' && type !== DocumentLinkTypes.WEB && type !== DocumentLinkTypes.DOI) {
            event.preventDefault();
        }

        if (type === DocumentLinkTypes.PREVIEW_PURCHASE_LINK) {
            const href = eventTarget.getAttribute('href') ?? '';

            if (!href) return;

            // @ts-ignore
            gtag('event', 'click', {
                event_category: 'external',
                event_label: 'preview_purchase_link',
                link_url: href
            });

            window.open(href, '_blank');
        }

        if (type === DocumentLinkTypes.GLOSSARY_TERM) {
            this.viewGlossaryTermFromElement(target);
        } else if (type === DocumentLinkTypes.BIBLIOGRAPHY) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('browse.read', id, {
                    queryParams: this.args.readQueryParams
                });
            }
        } else if (type === DocumentLinkTypes.BIBLIOGRAPHY_CF) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            const referenceText = target.parentElement?.firstElementChild?.textContent
                ?.trim()
                .replace(/(\r\n|\n|\r)/gm, '');

            if (id) {
                this.router.transitionTo('search', {
                    queryParams: { q: `cf::${id}//${referenceText}//` }
                });
            }
        } else if (type === DocumentLinkTypes.DOCUMENT) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('browse.read', id, {
                    queryParams: this.args.readQueryParams
                });
            }
        } else if (type === DocumentLinkTypes.MANUSCRIPT_VERSION) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            const isLatest = attributes.getNamedItem('data-latest');

            if (id) {
                this.router.transitionTo('browse.read', id, {
                    queryParams: { ...this.args.readQueryParams, archive: isLatest ? undefined : 'true' }
                });
            }
        } else if (type === DocumentLinkTypes.PAGE) {
            let documentId = null;
            let pageOrTarget = null;
            const reference = attributes.getNamedItem('data-r')?.nodeValue;
            // If reference does not include a period, its a local link inside that document
            // Otherwise it must include some sort of document ID and a possible page
            if (!reference?.includes('.')) {
                documentId = this.args.document.id;
                pageOrTarget = reference;
            } else {
                const referenceArray = reference?.split(/\.(?=[^\.]+$)/) ?? [];
                documentId = referenceArray[0];
                pageOrTarget = referenceArray[1];
            }

            pageOrTarget = pageOrTarget?.substring(0, 1) === 'P' ? eventTarget.innerText : pageOrTarget;

            if (documentId === this.args.document.id && pageOrTarget && this.args.target !== 'abstract') {
                //scroll to page number
                this.scrollToPageOrTarget(pageOrTarget);
            } else if (documentId) {
                //transition to a different document with a specific page
                this.router.transitionTo('browse.read', documentId, {
                    queryParams: {
                        page: pageOrTarget
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
            this.args.viewSearch({
                searchTerms: JSON.stringify([{ term: name, type: SearchTermId.AUTHOR, value: name }])
            });
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
        } else if (type === DocumentLinkTypes.BANNER) {
            const parent = target.parentElement;
            if (parent) {
                const sourceCode = parent.getAttribute('data-journal-code');
                if (sourceCode) {
                    if (this.args.document.sourceType === SourceType.JOURNAL) {
                        this.router.transitionTo('browse.journal', sourceCode);
                    }
                }
            }
        } else if (type === DocumentLinkTypes.TITLE) {
            if (target) {
                const sourceCode = target.getAttribute('data-journal-code');
                const volume = target.getAttribute('data-volume');

                if (sourceCode && volume) {
                    this.router.transitionTo('browse.journal.volume', sourceCode, volume);
                }
            }
        } else if (type === DocumentLinkTypes.KEYWORD) {
            const keyword = target.getAttribute('data-keyword');
            if (keyword) {
                this.args.viewSearch({ q: keyword });
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
    @action
    async scrollToSearchHit(hitNumber: string) {
        const element = this.containerElement?.querySelector(`[data-hit-number='${hitNumber}']`);
        await this.animateScrollToElement(element);
        element?.classList.add('search-hit-selected');
    }

    findPreviousHeading(element: HTMLElement): HTMLElement | null {
        // Create a TreeWalker with a filter that accepts any heading element
        let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
            acceptNode: (node: Node) => {
                if (node instanceof HTMLElement) {
                    // Check if the node is one of the heading elements
                    return /^(H[1-6])$/.test(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_SKIP;
            }
        } as NodeFilter);

        // Set the current node of the walker to the element
        walker.currentNode = element;

        // Move backwards in the DOM and return the first heading element found
        return walker.previousNode() as HTMLElement | null;
    }

    /**
     * Scroll to a specific page in the document (by scrolling to a specific page element)
     *
     * @param {number} pageOrTarget
     * @memberof DocumentText
     */

    async scrollToPageOrTarget(pageOrTarget: string) {
        let element = this.containerElement?.querySelector(`[data-pgnum='${pageOrTarget}']`);

        if (element) {
            element = this.findPreviousHeading(element as HTMLElement);
        }

        if (!element && this.args.document.accessClassification === 'preview') {
            const notices = this.containerElement?.querySelectorAll('.notice');
            if (notices) {
                for (const notice of notices) {
                    const pages = notice.getAttribute('pages');
                    if (pages && pages.includes(pageOrTarget.toString().toLowerCase())) {
                        element = notice as HTMLElement;
                        break;
                    }
                }
            }
        }

        if (!element) {
            element =
                this.containerElement?.querySelector(`[data-page-start='${pageOrTarget}']`) ??
                this.containerElement?.querySelector(`#${pageOrTarget}`);
        }

        if (!element) {
            return;
        }

        this.pageTracking = false;
        await this.animateScrollToElement(element);
        this.pageTracking = true;
    }

    /**
     * Animated the scroll to an element using a specified vertical offset
     *
     * @param {(Element | null)} [element]
     * @memberof DocumentText
     */
    //@ts-ignore: Ignore 'not all code paths return values'
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
        this.generateDocument(text);
    }

    /**
     * Set up the tooltips and if we get passed in a page number - scroll to it
     * Also add intersection observers to all pagebreaks, in order to know how far the user has scroll down the document
     *
     * @param {HTMLElement} element
     * @memberof DocumentText
     */

    @action
    async setupListeners(element: HTMLElement): Promise<void> {
        this.containerElement = element;
        this.scrollableElement = this.containerElement?.closest('.page-content-inner');
        scheduleOnce('afterRender', this, this.afterRender);
        const observer = new IntersectionObserver(
            (entries) => {
                if (this.pageTracking) {
                    next(() => this.itemVisible(entries));
                }
            },
            { threshold: 1 }
        );
        const pageBreaks = this.containerElement.querySelectorAll('div.pagebreak');
        Object.values(pageBreaks).forEach((item) => {
            // eslint-disable-next-line ember/no-observers
            observer.observe(item);
        });
    }

    /**
     * When the item is visible, call the function to update the viewable page.
     *
     * @param {IntersectionObserverEntry[]} entries
     * @memberof DocumentText
     */
    @action
    itemVisible(entries: IntersectionObserverEntry[]) {
        const newVisiblePages: string[] = [];
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const pageNumber = entry.target.getAttribute('data-page-end');
                if (pageNumber) {
                    newVisiblePages.push(pageNumber);
                }
            }
        });
        if (newVisiblePages.length) {
            this.visiblePages = newVisiblePages;
            this.args.viewablePageUpdate?.(this.visiblePages[0]);
        }
    }

    async afterRender() {
        this.processTranslations();
        if (this.args.document.document && !this.args.document.accessLimited) {
            await this.insertBiblioLinks();
        }
        this.attachTooltips();
    }

    async processTranslations() {
        const elements = this.containerElement?.querySelectorAll('[data-i18n-key]');
        elements?.forEach((element) => {
            const key = element.getAttribute('data-i18n-key');
            if (!key) return;

            let params: { [key: string]: string } = {};

            Array.from(element.attributes).forEach((attr) => {
                if (attr.name.startsWith('data-i18n-param-')) {
                    const paramName = attr.name.substring('data-i18n-param-'.length);
                    params[paramName] = attr.value;
                }
            });

            const translation = this.intl.t(key, params);

            if (element.childNodes.length === 0 || element.childNodes[0].nodeType !== Node.TEXT_NODE) {
                const textNode = document.createTextNode(translation);
                element.prepend(textNode);
            } else {
                element.childNodes[0].nodeValue = translation;
            }
        });
    }

    async insertBiblioLinks() {
        const bibliographyData = await this.store.query('biblio', {
            id: this.args.document.id,
            documentYear: this.args.document.year
        });

        bibliographyData.forEach((biblio) => {
            const biblioElement = this.containerElement?.querySelector(`[id="${biblio.refLocalId}"]`);
            if (!biblioElement) return;

            // TEMPORARY UNTIL FULl REBUILD REMOVES LINKS FROM XML
            const bibxElements = biblioElement.querySelectorAll('[class^="bibx"]');
            bibxElements.forEach((element) => element.remove());
            // END TEMPORARY CODE

            if (biblio.refRx) {
                const anchorElement = document.createElement('a');
                anchorElement.setAttribute('class', 'bibx pl-2');
                anchorElement.setAttribute('data-type', 'BIBX');
                anchorElement.setAttribute('data-document-id', biblio.refRx);

                const arrowElement = new DOMParser().parseFromString(arrow, 'text/html').body.firstChild as SVGElement;
                anchorElement.appendChild(arrowElement);

                biblioElement.appendChild(anchorElement);
            } else if (biblio.refRxcf) {
                const anchorElement = document.createElement('a');
                anchorElement.setAttribute('class', 'bibx pl-2');
                anchorElement.setAttribute('data-type', 'BIBX_CF');
                anchorElement.setAttribute('data-document-id', biblio.refRxcf);

                const linkElement = new DOMParser().parseFromString(link, 'text/html').body.firstChild as SVGElement;
                anchorElement.appendChild(linkElement);
                biblioElement.appendChild(anchorElement);
                const spanElement = document.createElement('span');
                spanElement.setAttribute('class', 'bibx-related-info ml-1');

                const tooltipElement = new DOMParser().parseFromString(tooltip, 'text/html').body
                    .firstChild as SVGElement;
                spanElement.appendChild(tooltipElement);

                biblioElement.appendChild(spanElement);
            }
        });
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

        const notes = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.NOTE_TIP);
        notes?.forEach((item) => {
            const node = item?.querySelector(`.peppopuptext`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    placement: 'right',
                    ...this.tippyOptions
                });
            }
        });

        const newAuthorTooltips = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.NEW_AUTHOR);
        newAuthorTooltips?.forEach((item) => {
            const node = item?.querySelector(`.peppopuptext`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    placement: 'right',
                    ...this.tippyOptions
                });
            }
        });

        const authorTooltips = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.AUTHOR_TIP);
        authorTooltips?.forEach((item) => {
            const node = item?.querySelector(`.autcontent`);
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

        if (this.currentUser.preferences?.translationConcordanceEnabled) {
            const translations = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.TRANSLATION);
            const loadingTranslation = this.intl.t('common.loading');
            translations?.forEach((item) => {
                const paraLangId = item.attributes.getNamedItem('data-lgrid')?.nodeValue;
                const paraLangRx = item.attributes.getNamedItem('data-lgrx')?.nodeValue;

                const paragraph = item.parentElement;
                if ((paraLangId || paraLangRx) && paragraph) {
                    tippy(item, {
                        appendTo: paragraph,
                        content: loadingTranslation,
                        maxWidth: 'none',
                        ...this.tippyOptions,
                        onCreate(instance: DocumentTippyInstance) {
                            // Setup our own custom state properties - from DOCS
                            instance._isFetching = false;
                            instance._loaded = false;
                        },
                        onShow: (instance: DocumentTippyInstance) => {
                            if (instance._isFetching || instance._loaded) {
                                return;
                            }

                            this.loadTranslation?.(paraLangId, paraLangRx)
                                .then(async (text: string) => {
                                    const xml = await this.parseDocumentText(text, {
                                        translationEnabled: false
                                    });
                                    if (xml) {
                                        const s = new XMLSerializer();
                                        const html = this.replaceHitMarkerText(s.serializeToString(xml));
                                        instance._loaded = true;
                                        instance.setContent(html);
                                    }
                                })
                                .finally(() => {
                                    instance._isFetching = false;
                                });
                        },
                        onHidden(instance: DocumentTippyInstance) {
                            instance.setContent(loadingTranslation);
                            instance._loaded = false;
                        }
                    });
                }
            });
        }

        const title = this.containerElement?.querySelector(DocumentTooltipSelectors.TITTLE_HELP);
        if (title) {
            tippy(title, {
                content: this.intl.t('document.text.help.title'),
                ...this.tippyOptions,
                delay: this.tippyHelpDelay
            });
        }

        const banner = this.containerElement?.querySelector(DocumentTooltipSelectors.BANNER_HELP);
        if (banner && this.args.document.sourceType === SourceType.JOURNAL) {
            tippy(banner, {
                content: this.intl.t('document.text.help.journalBanner'),
                ...this.tippyOptions,
                delay: this.tippyHelpDelay
            });
        }

        const authors = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.AUTHOR_HELP);
        if (authors) {
            authors?.forEach((item) => {
                tippy(item, {
                    appendTo: () => document.body,
                    content: this.intl.t('document.text.help.author'),
                    ...this.tippyOptions,
                    delay: this.tippyHelpDelay
                });
            });
        }
    }

    /**
     *
     *
     * @param {string} paraLangId
     * @param {string} paraLangRx
     * @return {*}
     * @memberof DocumentText
     */
    @action
    async loadTranslation(paraLangId?: string | null, paraLangRx?: string | null) {
        let url = `Documents/Concordance/?return_format=XML`;
        if (paraLangId) {
            url += `&paralangid=${paraLangId}`;
        }
        if (paraLangRx) {
            url += `&paralangrx=${paraLangRx}`;
        }
        const results = await this.ajax.request<{
            documents?: { responseSet?: Document[] };
        }>(url, {
            appendTrailingSlash: false
        });
        return results.documents?.responseSet?.[0].document;
    }

    /**
     * Turn off page tracking so even if the user happens to scroll before the component is destroyed, we dont update the page
     *
     * @memberof DocumentText
     */
    willDestroy(): void {
        this.pageTracking = false;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Document::Text': typeof DocumentText;
    }
}
