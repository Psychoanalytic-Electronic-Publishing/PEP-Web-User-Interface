import Controller from '@ember/controller';
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

    get embargoPublicationDate() {
        return this.configuration.base.global.embargoDate;
    }

    get publisherInformation() {
        const code = this.sourcecode;
        return this.configuration.content.global.publishers.find((publisher) => publisher.sourceCode === code);
    }

    get showEmbargoInformation() {
        return this.publisherInformation?.embargoYears !== '0';
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/index': BrowseJournalIndex;
    }
}
