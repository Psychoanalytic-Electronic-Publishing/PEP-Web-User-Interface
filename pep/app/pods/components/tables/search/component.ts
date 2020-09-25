import Document from 'pep/pods/document/model';
import Component from '@glimmer/component';
import { ColumnValue } from '@gavant/ember-table';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';
import FastbootMediaService from 'pep/services/fastboot-media';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface TablesSearchArgs {
    rows: Document[];
    hasMoreRows: boolean;
    loadMoreRows: () => Document[];
    isLoading: boolean;
}

export default class TablesSearch extends Component<TablesSearchArgs> {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;

    @tracked expandedRows = this.args.rows;

    /**
     * Columns for the table. The `computed` is required
     *
     * @readonly
     * @type {ColumnValue[]}
     * @memberof TablesMostViewed
     */
    @computed()
    get columns(): ColumnValue[] {
        return [
            {
                valuePath: 'authorMast',
                name: this.intl.t('search.table.author'),
                isSortable: true
            },

            {
                name: this.intl.t('search.table.year'),
                valuePath: 'year',
                isSortable: true
            },
            {
                name: this.intl.t('search.table.title'),
                valuePath: 'title',
                isSortable: true,
                cellComponent: 'tables/cell/html'
            },
            {
                name: this.intl.t('search.table.source'),
                valuePath: 'documentRef',
                isSortable: true
            }
        ];
    }
}
