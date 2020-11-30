import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PUBPERIOD_ALL_YEARS } from 'pep/constants/sidebar';
import { useQueryParams } from 'pep/hooks/useQueryParams';
import { PageNav } from 'pep/mixins/page-layout';
import Document from 'pep/pods/document/model';
import MostViewedController from 'pep/pods/most-viewed/controller';

interface RouteQueryParams {
    author: string;
    title: string;
    sourcename: string;
    pubperiod?: string;
}

export default class MostViewed extends PageNav(Route) {
    navController = 'most-viewed';
    /**
     * Load the widget results data
     */
    async model(queryParams: RouteQueryParams) {
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('most-viewed'),
            pagingRootKey: null,
            filterRootKey: null,
            filterList: ['author', 'title', 'sourcename', 'pubperiod', 'queryType'],
            processQueryParams: (params) => {
                const newParams = {
                    ...params,
                    ...queryParams
                };
                if (newParams.pubperiod === PUBPERIOD_ALL_YEARS.value) {
                    delete newParams.pubperiod;
                }
                return newParams;
            }
        });
        return this.store.query('document', removeEmptyQueryParams(apiQueryParams));
    }

    /**
     * Set up pagination on the controller
     * @param {MostViewedController} controller
     * @param {object} model
     */
    setupController(controller: MostViewedController, model: RecordArrayWithMeta<Document>) {
        super.setupController(controller, model);
        controller.paginator = usePagination<Document>({
            context: controller,
            modelName: 'document',
            models: model?.toArray() ?? [],
            metadata: model?.meta,
            filterList: ['author', 'title', 'sourcename', 'pubperiod', 'queryType', 'citeperiod'],
            pagingRootKey: null,
            filterRootKey: null,
            sorts: [''],
            onChangeSorting: controller.onChangeSorting,
            processQueryParams: (params) => {
                if (params.pubperiod === PUBPERIOD_ALL_YEARS.value) {
                    delete params.pubperiod;
                }
                return params;
            }
        });
        controller.searchQueryParams = useQueryParams({
            context: controller,
            params: ['author', 'title', 'journal', 'pubperiod', 'citeperiod']
        });
    }
}
