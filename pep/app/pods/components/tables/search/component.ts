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
    showHitsInContext: boolean;
    openPreview: (document: Document) => void;
}

export default class TablesSearch extends Component<TablesSearchArgs> {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;

    @tracked expandedRows = this.args.rows;
    defaultExpandedRows = [];
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
                valuePath: 'id',
                cellComponent: 'tables/cell/checkbox',
                isSortable: false,
                width: 10,
                staticWidth: 10
            },
            {
                valuePath: 'authorMast',
                name: this.intl.t('search.table.author'),
                isSortable: true,
                staticWidth: 75,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.openPreview
            },

            {
                name: this.intl.t('search.table.year'),
                valuePath: 'year',
                isSortable: true,
                staticWidth: 25,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.openPreview
            },
            {
                name: this.intl.t('search.table.title'),
                valuePath: 'title',
                isSortable: true,
                staticWidth: 100,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.openPreview
            },
            {
                name: this.intl.t('search.table.source'),
                valuePath: 'documentRef',
                isSortable: true,
                staticWidth: 100
            }
        ];
    }
}
