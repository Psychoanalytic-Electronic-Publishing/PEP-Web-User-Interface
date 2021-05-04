import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';

import Book from 'pep/pods/book/model';
import Journal from 'pep/pods/journal/model';
import Source from 'pep/pods/source/model';
import ConfigurationService from 'pep/services/configuration';

export default class BrowseBookVolumesIndex extends Controller {
    @service configuration!: ConfigurationService;
    @tracked paginator!: Pagination<Source>;
    @tracked sourcecode?: string;
    @tracked book?: Book;

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
        'browse/book/volumes/index': BrowseBookVolumesIndex;
    }
}
