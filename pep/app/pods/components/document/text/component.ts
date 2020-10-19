import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import { DS } from 'ember-data';

import GlossaryTerm from 'pep/pods/glossary-term/model';
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

    @tracked xml?: XMLDocument;

    constructor(owner, args) {
        super(owner, args);
        const XML = parseXML(this.args.text);
        if (!(XML instanceof Error)) {
            const artinfo = XML.getElementsByTagName('artinfo')[0];
            artinfo.parentNode?.removeChild(artinfo);
            const bibliography = XML.getElementsByTagName('bib')[0];
            this.convertBibliography(bibliography);
            this.convertPageBreaks(XML);
            this.xml = XML;
        }
    }

    convertPageBreaks(xml: XMLDocument) {
        const pageBreaks = Array.from(xml.getElementsByTagName('pb') ?? []);
        pageBreaks?.forEach((tag) => {
            const number = tag.getElementsByTagName('n')[0];
            number.classList.add('text-muted');
            number.classList.add('small');

            const div = document.createElement('div');
            div.classList.add('text-center');
            div.appendChild(number);

            tag.appendChild(div);
        });
    }

    convertBibliography(element: Element) {
        const bilbiography = element;
        const information = bilbiography.getElementsByTagName('pb')[0];
        const sources = Array.from(bilbiography.getElementsByTagName('be'));
        const html = sources.map((item) => {
            const div = document.createElement('div');
            div.appendChild(item);
            return div;
        });
        html.forEach((item) => {
            bilbiography.appendChild(item);
        });
        bilbiography.removeChild(information);
        bilbiography.appendChild(information);
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
