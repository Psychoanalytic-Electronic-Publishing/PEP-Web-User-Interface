import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import IntlService from 'ember-intl/services/intl';

import { Sorting } from '@gavant/ember-pagination/hooks/pagination';
import { ColumnValue, TableSort } from '@gavant/ember-table';

import Document from 'pep/pods/document/model';
import FastbootMediaService from 'pep/services/fastboot-media';
import { SearchTableSortFields } from 'pep/utils/sort';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface TablesSearchArgs {
    containerSelector?: string;
    hasMoreRows: boolean;
    headerStickyOffset?: string;
    isLoading: boolean;
    rows: Document[];
    showHitsInContext: boolean;
    document: Document;
    sorts?: TableSort[];
    key?: string;
    idForFirstItem?: string;
    loadMoreRows: () => Promise<Document[]> | undefined;
    onLinkClick: (document: Document) => void;
    updateSorts: (newSorts: Sorting[]) => Promise<Document[]>;
}

export default class TablesSearch extends Component<BaseGlimmerSignature<TablesSearchArgs>> {
    @service intl!: IntlService;
    @service fastbootMedia!: FastbootMediaService;
    @service fastboot!: FastbootService;

    get expandedRows() {
        return this.args.showHitsInContext ? this.args.rows : [];
    }

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
    @computed('args.onLinkClick')
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
                valuePath: SearchTableSortFields.AUTHOR_MAST,
                name: this.intl.t('search.table.author'),
                isSortable: true,
                staticWidth: 75,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.onLinkClick,
                width: 75,
                minWidth: 75
            },

            {
                name: this.intl.t('search.table.year'),
                valuePath: SearchTableSortFields.YEAR,
                isSortable: true,
                staticWidth: 50,
                width: 50,
                minWidth: 50,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.onLinkClick
            },
            {
                name: this.intl.t('search.table.title'),
                valuePath: SearchTableSortFields.TITLE,
                isSortable: true,
                staticWidth: 100,
                minWidth: 100,
                cellComponent: 'tables/cell/document-link',
                onClick: this.args.onLinkClick,
                width: 100
            },
            {
                name: this.intl.t('search.table.source'),
                valuePath: SearchTableSortFields.DOCUMENT_REF,
                isSortable: true,
                staticWidth: 100,
                minWidth: 100,
                width: 100
            },
            {
                valuePath: 'id',
                cellComponent: 'tables/cell/search-action',
                isSortable: false,
                width: 50,
                minWidth: 50,
                staticWidth: 50
            }
        ];
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Tables::Search': typeof TablesSearch;
    }
}
