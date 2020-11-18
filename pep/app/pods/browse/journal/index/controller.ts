import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';

import Journal from 'pep/pods/journal/model';
import Source from 'pep/pods/source/model';
import ConfigurationService from 'pep/services/configuration';

export default class BrowseJournalIndex extends Controller {
    @service configuration!: ConfigurationService;
    @tracked paginator!: Pagination<Source>;
    @tracked sourcecode?: string;
    @tracked journal?: Journal;

    get publisherInformation() {
        const code = this.sourcecode;
        return this.configuration.content.global.publishers.find((publisher) => publisher.sourceCode === code);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/index': BrowseJournalIndex;
    }
}