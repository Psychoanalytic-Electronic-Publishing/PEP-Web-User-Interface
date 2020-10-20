import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { DS } from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import LoadingBarService from 'pep/services/loading-bar';
import { findElement, findElements, parseXML, PepXmlTagNames } from 'pep/utils/dom';

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

    @tracked xml?: XMLDocument;

    constructor(owner: unknown, args: DocumentTextArgs) {
        super(owner, args);
        this.parseDocumentText(args.text);
    }

    @dontRunInFastboot
    parseDocumentText(text: string) {
        const XML = parseXML(text);
        if (!(XML instanceof Error)) {
            const artinfo = findElement(XML, PepXmlTagNames.ARTICLE_INFO);
            artinfo.parentNode?.removeChild(artinfo);

            this.convertBibliography(XML);
            this.convertPageBreaks(XML);
            this.xml = XML;
        } else {
            this.notifications.error(this.intl.t('document.text.error'));
        }
    }

    convertPageBreaks(xml: XMLDocument) {
        const pageBreaks = findElements(xml, PepXmlTagNames.PAGE_BREAK);
        pageBreaks?.forEach((tag) => {
            const number = findElement(tag, PepXmlTagNames.NUMBER);
            number.classList.add('text-muted');
            number.classList.add('small');

            const div = document.createElement('div');
            div.classList.add('text-center');
            div.appendChild(number);

            tag.appendChild(div);
        });
    }

    convertBibliography(xml: XMLDocument) {
        const bibliography = findElement(xml, PepXmlTagNames.BIBLIOGRAPHY);
        const information = findElement(bibliography, PepXmlTagNames.PAGE_BREAK);
        const sources = findElements(bibliography, PepXmlTagNames.BIBLIOGRAPHY_SOURCE);
        const html = sources.map((item) => {
            const div = document.createElement('div');
            div.appendChild(item);
            return div;
        });
        html.forEach((item) => {
            bibliography.appendChild(item);
        });
        bibliography.removeChild(information);
        bibliography.appendChild(information);
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
}
