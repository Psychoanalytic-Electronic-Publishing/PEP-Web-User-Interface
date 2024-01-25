import Component from '@glimmer/component';
import Biblio from 'pep/pods/biblio/model';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Owner from '@ember/application';
import { action } from '@ember/object';
import Store from '@ember-data/store';
import ArrayProxy from '@ember/array/proxy';

interface BibliographyArgs {
    documentId: string;
}

export default class Bibliography extends Component<BibliographyArgs> {
    @service('store') store!: Store;
    @tracked bibliographyData: ArrayProxy<Biblio> | null = null;
    @tracked isLoading = false;

    constructor(owner: Owner, args: BibliographyArgs) {
        super(owner, args);
        this.loadBibliographyData();
    }

    @action
    async loadBibliographyData() {
        try {
            this.isLoading = true;
            this.bibliographyData = await this.store.query('biblio', { id: this.args.documentId });
        } catch (error) {
            console.error('Error fetching bibliography data:', error);
            // Handle errors as needed
        } finally {
            this.isLoading = false;
        }
    }
}
