import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ModalService from '@gavant/ember-modals/services/modal';
import { DS } from 'ember-data';

import GlossaryTerm from 'pep/pods/glossary-term/model';
import LoadingBarService from 'pep/services/loading-bar';

interface DocumentTextArgs {
    text: XMLDocument;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
}

export default class DocumentText extends Component<DocumentTextArgs> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;

    get text() {
        // const xmlimages = this.args.text.getElementsByTagName('image');
        return this.args.text;
    }

    @action
    setupListeners() {
        $('.document-text').on('click', (event: JQuery.TriggeredEvent) => {
            const attributes = event.target.attributes as NamedNodeMap;
            const type = attributes.getNamedItem('type')?.nodeValue;
            if (type === 'TERM2') {
                const rx = attributes.getNamedItem('rx')?.nodeValue;
                if (rx) {
                    const id = rx.split('.');
                    this.viewGlossaryTerm(event.target.innerText, id[id.length - 1]);
                }
            }
        });
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
