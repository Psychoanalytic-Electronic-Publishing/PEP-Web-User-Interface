import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';

export default class AdminEnUs extends Controller {
    @tracked changeset?: BufferedChangeset;

    /**
     * Save the english admin items
     *
     * @memberof AdminEnUs
     */
    @action
    save(): void {
        this.changeset?.save();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/en-us': AdminEnUs;
    }
}
