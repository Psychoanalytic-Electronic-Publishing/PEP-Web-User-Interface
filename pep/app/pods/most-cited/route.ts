import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { useQueryParams } from 'pep/hooks/useQueryParams';
import { PageNav } from 'pep/mixins/page-layout';
import Document from 'pep/pods/document/model';
import MostCitedController from 'pep/pods/most-cited/controller';

import { PUBPERIOD_ALL_YEARS } from '../../constants/sidebar';

interface RouteQueryParams {
    author: string;
    title: string;
    sourcename: string;
    pubperiod?: string;
}

export default class MostCited extends PageNav(Route) {
    navController = 'most-cited';

    /**
     * Load the table data
     *
     * @returns {Promise<Document[]>}
     * @memberof MostCited
     */
    async model(queryParams: RouteQueryParams) {
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('most-cited'),
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
     * Set up the pagination on the controller
     * @param {MostCitedController} controller
     * @param {object} model
     */
    setupController(controller: MostCitedController, model: RecordArrayWithMeta<Document>) {
        super.setupController(controller, model);
        controller.paginator = usePagination<Document>({
            context: controller,
            modelName: 'document',
            models: model?.toArray() ?? [],
            metadata: model?.meta,
            filterList: ['author', 'title', 'sourcename', 'pubperiod', 'queryType'],
            pagingRootKey: null,
            filterRootKey: null,
            processQueryParams: (params) => {
                if (params.pubperiod === PUBPERIOD_ALL_YEARS.value) {
                    delete params.pubperiod;
                }
                return params;
            }
        });
        controller.searchQueryParams = useQueryParams({
            context: controller,
            params: ['author', 'title', 'journal', 'pubperiod']
        });
    }
}
