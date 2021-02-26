import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { BufferedChangeset } from 'ember-changeset/types';
import IntlService from 'ember-intl/services/intl';

import { ColumnValue } from '@gavant/ember-table';

import { Language } from 'pep/constants/lang';
import FastbootMediaService from 'pep/services/fastboot-media';

export default class AdminLanguage extends Controller {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;

    @tracked changeset?: BufferedChangeset;
    @tracked language?: Language;

    /**
     * Save the english admin items
     *
     * @memberof AdminLanguage
     */
    @action
    save(): void {
        this.changeset?.save();
    }

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof AdminLanguage
     */
    @computed()
    get columns(): ColumnValue[] {
        return [
            {
                id: '0',
                valuePath: 'sourceCode',
                name: this.intl.t('mostCited.table.title'),

                isSortable: false
            },

            {
                name: this.intl.t('mostCited.table.fiveYears'),
                valuePath: 'description',

                isSortable: true
            }
        ];
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'admin/language': AdminLanguage;
    }
}
