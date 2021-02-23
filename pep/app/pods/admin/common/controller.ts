import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';

export default class AdminCommon extends Controller {
    @tracked changeset?: BufferedChangeset;

    @action
    save() {
        this.changeset?.save();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/common': AdminCommon;
    }
}
