import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { GlossaryWidgetLocation, WIDGET } from 'pep/constants/sidebar';
import { PageNav } from 'pep/mixins/page-layout';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';
import BrowseReadController from 'pep/pods/browse/read/controller';
import Document from 'pep/pods/document/model';
import SearchDocument from 'pep/pods/search-document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService, { VIEW_DOCUMENT_FROM } from 'pep/services/current-user';
import ScrollableService from 'pep/services/scrollable';
import SidebarService from 'pep/services/sidebar';
import { buildBrowseRelatedDocumentsParams, buildSearchQueryParams } from 'pep/utils/search';

export interface BrowseReadParams {
    document_id: string;
    index: string;
}

export default class BrowseRead extends PageNav(Route) {
    @service configuration!: ConfigurationService;
    @service sidebar!: SidebarService;
    @service currentUser!: CurrentUserService;
    @service scrollable!: ScrollableService;
    @service fastboot!: FastbootService;

    navController = 'browse.read';
    relatedDocuments?: Document[];
    relatedDocumentsMeta?: any;

    queryParams = {
        page: {
            replace: true
        },
        index: {
            replace: true
        }
    };

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    model(params: BrowseReadParams) {
        return this.store.findRecord('document', params.document_id, {
            reload: true
        });
    }

    /**
     * Fetch the search results for the document sidebar
     * @param {Object} model
     * @param {Transition} transition
     */
    async afterModel(model: Document, transition: Transition) {
        super.afterModel(model, transition);
        const controller = this.controllerFor(this.routeName) as BrowseReadController;

        const params = buildBrowseRelatedDocumentsParams(model);
        const searchParams = buildSearchQueryParams(params);
        const controllerParams = this.paramsFor('browse.read') as { page: string; index: string };
        const queryParams = buildQueryParams({
            context: controller,
            pagingRootKey: null,
            filterRootKey: null,
            limit: Number(controllerParams.index) + controller.pagingLimit,
            sorts:
                controller.selectedView.id === controller.tableView
                    ? ['']
                    : [this.currentUser.preferences?.searchSortType.id ?? ''],

            processQueryParams: (params) => ({ ...params, ...searchParams })
        });
        const response = (await this.store.query('search-document', queryParams)) as RecordArrayWithMeta<
            SearchDocument
        >;
        const results = response.toArray();
        const resultsMeta = response.meta;

        this.relatedDocuments = results;
        this.relatedDocumentsMeta = resultsMeta;
    }

    /**
     * Set the search results data on the controller
     * @param {SearchReadController} controller
     * @param {object} model
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    setupController(controller: BrowseReadController, model: Document, transition: Transition) {
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.setupController(controller, model, transition);

        controller.paginator = usePagination<Document, any>({
            context: controller,
            modelName: 'search-document',
            models: this.relatedDocuments ?? [],
            metadata: this.relatedDocumentsMeta,
            sorts:
                controller.selectedView.id === controller.tableView
                    ? ['']
                    : [this.currentUser.preferences?.searchSortType.id ?? ''],
            pagingRootKey: null,
            filterRootKey: null,
            processQueryParams: controller.processQueryParams,
            onChangeSorting: controller.onChangeSorting,
            limit: controller.pagingLimit
        });
        this.currentUser.lastViewedDocument = {
            id: model.id,
            from: VIEW_DOCUMENT_FROM.OTHER
        };

        controller.document = model;
        if (!this.fastboot.isFastBoot) {
            if (transition.to.queryParams.page) {
                controller.page = transition.to.queryParams.page;
            }
        }

        this.sidebar.update({
            [WIDGET.RELATED_DOCUMENTS]: model,
            [WIDGET.MORE_LIKE_THESE]: model,
            [WIDGET.GLOSSARY_TERMS]: {
                terms: model?.meta?.facetCounts.facet_fields.glossary_group_terms,
                location: GlossaryWidgetLocation.READ
            },
            [WIDGET.PUBLISHER_INFO]: model
        });

        controller.addAuthenticatedListener();
    }

    /**
     * Reset the page on the controller
     *
     * @param {BrowseReadController} controller
     * @param {boolean} _isExiting
     * @param {Transition} _transition
     * @memberof BrowseRead
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    resetController(controller: BrowseReadController, isExiting: boolean, transition: Transition): void {
        // @ts-ignore
        super.resetController(controller, isExiting, transition);
        controller.page = null;
        if (isExiting) {
            controller.removeAuthenticateListener();
            this.sidebar.update({
                [WIDGET.RELATED_DOCUMENTS]: null,
                [WIDGET.MORE_LIKE_THESE]: null,
                [WIDGET.GLOSSARY_TERMS]: null,
                [WIDGET.PUBLISHER_INFO]: null
            });
        }
    }

    /**
     * Top level route error event handler - If routes reject with an error
     * i.e. do not explicitly catch and handle errors return by their
     * model()/beforeModel()/afterModel() hooks, this will be invoked.
     * Which will redirect the user as needed, depending the type of error returned
     * @param {ApiServerErrorResponse} error
     */
    @action
    error(error?: ApiServerErrorResponse): boolean {
        if (this.fastboot.isFastBoot) {
            this.fastboot.response.statusCode = error?.errors?.[0]?.status ?? 200;
        }
        if (error?.errors?.length && error?.errors?.length > 0) {
            const status = error?.errors?.[0].status;
            if (status === '404') {
                this.replaceWith('four-oh-four-document', '404');
                //marks error as being handled
                return false;
            }
        }
        return true;
    }
}
