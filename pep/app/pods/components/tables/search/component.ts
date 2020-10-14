import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { ColumnValue } from '@gavant/ember-table';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import IntlService from 'ember-intl/services/intl';

import Document from 'pep/pods/document/model';
import FastbootMediaService from 'pep/services/fastboot-media';

interface TablesSearchArgs {
    containerSelector?: string;
    hasMoreRows: boolean;
    headerStickyOffset?: string;
    isLoading: boolean;
    loadMoreRows: () => Document[];
    onLinkClick: (document: Document) => void;
    rows: Document[];
    showHitsInContext: boolean;
    document: Document;
}

export default class TablesSearch extends Component<TablesSearchArgs> {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;
    @service fastboot!: FastbootService;

    @tracked expandedRows = this.args.rows;
    defaultExpandedRows = [];

    get headerStickyOffset() {
        return this.args.headerStickyOffset ?? '70';
    }
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
                onClick: this.args.onLinkClick
            },

            {
                name: this.intl.t('search.table.year'),
                valuePath: 'year',
                isSortable: true,
                staticWidth: 50,
                width: 50,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.onLinkClick
            },
            {
                name: this.intl.t('search.table.title'),
                valuePath: 'title',
                isSortable: true,
                staticWidth: 100,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.onLinkClick
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
