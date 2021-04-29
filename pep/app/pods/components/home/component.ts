import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import CookiesService from 'ember-cookies/services/cookies';
import { DS } from 'ember-data';

import ModalService from '@gavant/ember-modals/services/modal';

import moment from 'moment';
import { MEDIA_FILE_EXTENSION_REGEX } from 'pep/constants/regex';
import Abstract from 'pep/pods/abstract/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import SearchDocument from 'pep/pods/search-document/model';
import AjaxService from 'pep/services/ajax';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import FastbootMediaService from 'pep/services/fastboot-media';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import SidebarService from 'pep/services/sidebar';
import { buildSearchQueryParams } from 'pep/utils/search';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface HomeArgs {}

export default class Home extends Component<BaseGlimmerSignature<HomeArgs>> {
    @service sidebar!: SidebarService;
    @service modal!: ModalService;
    @service fastbootMedia!: FastbootMediaService;
    @service configuration!: ConfigurationService;
    @service auth!: AuthService;
    @service('pep-session') session!: PepSessionService;
    @service store!: DS.Store;
    @service router!: RouterService;
    @service loadingBar!: LoadingBarService;
    @service cookies!: CookiesService;
    @service ajax!: AjaxService;

    /**
     * The approximate width where the graphic
     * wraps above the expert-pick text.
     *
     */
    graphicWrapWidth = 725;

    @tracked model?: Abstract;
    @tracked imageArticle?: SearchDocument;
    @tracked imageId?: string;

    get intro() {
        return this.configuration.content.home.intro;
    }

    get expertPick() {
        const expertPicks = this.configuration.base.home.expertPicks;
        return expertPicks[this.expertPickIndex];
    }

    get imageArticleUrl() {
        return this.imageArticle?.id ? this.router.urlFor('browse.read', this.imageArticle?.id) : '';
    }

    get expertPickIndex() {
        const expertPicks = this.configuration.base.home.expertPicks;
        const specialDate = this.configuration.base.home.expertPicksStartDate;
        const dayDifferential = moment(new Date()).diff(specialDate, 'days');
        return dayDifferential % expertPicks.length;
    }

    /**
     * Open the search form sidebar
     * @returns {void}
     */
    @action
    showSearch() {
        return this.sidebar.toggleLeftSidebar(true);
    }

    /**
     * Opens login modal (if user is not logged in already)
     * and then transitions to the document read page
     * @returns {void | Promise<void>}
     */
    @action
    readExpertPick() {
        if (!this.session.isAuthenticated) {
            return this.auth.openLoginModal(true);
        } else {
            return this.transitionToExpertPick();
        }
    }

    /**
     * /**
     * Opens login modal (if user is not logged in already)
     * and then transitions to the document read page
     * @returns {void | Promise<void>}
     */
    @action
    readImageDocument(event?: Event) {
        event?.preventDefault();
        if (!this.session.isAuthenticated) {
            return this.auth.openLoginModal(true);
        } else {
            return this.transitionToImageDocument();
        }
    }

    /**
     * Load the `Document` that contains the expert image
     * of the day.
     * Transition to this document's read page.
     */
    @action
    async transitionToImageDocument() {
        return this.router.transitionTo('browse.read', this.imageArticle!.id);
    }

    /**
     * Load the expert pick article once the user is logged in
     * @returns {Promise<void>}
     */
    @action
    async transitionToExpertPick() {
        return this.router.transitionTo('browse.read', this.expertPick.articleId);
    }

    /**
     *Returns the expert pick of the day abstract
     *
     * @return {*}  {Promise<void>}
     * @memberof Home
     */
    @action
    async loadModel(): Promise<void> {
        const result = await this.store.findRecord('abstract', this.expertPick.articleId);
        this.model = result;
        let imageId = this.expertPick.imageId;

        // if there was no expert pick image then load a random one
        if (!imageId || imageId === '*') {
            const result = await this.ajax.request<{ documentID: string; graphic: string }>(
                'Documents/Image/*?download=2'
            );
            imageId = result.graphic.replace(MEDIA_FILE_EXTENSION_REGEX, '');
        }
        const queryParams = buildSearchQueryParams({
            smartSearchTerm: `art_graphic_list: ${imageId}`
        });
        const imageArticleResults = await this.store.query('search-document', queryParams);
        const imageArticle = imageArticleResults.toArray()[0];
        this.imageArticle = imageArticle;
        this.imageId = imageId;
    }

    /**
     * Open the glossary modal to view the term
     *
     * @param {string} term
     * @param {GlossaryTerm} results
     * @memberof ReadDocument
     */
    @action
    viewGlossaryTerm(term: string, results: GlossaryTerm) {
        this.modal.open('glossary', {
            results,
            term
        });
    }

    /**
     * Handle the resizing of the "Expert Pick of the Day" card.
     *
     * This does a more proper job of handling the resizing from the side-panels
     * than bootstrap alone.
     *
     * This is also called on the insertion of the '.expert-pick-graphic-container' to ensure it's properly
     * sized and spaced.
     * @param el
     */
    @action
    handleResize(el: HTMLElement) {
        const graphicContainer = el.className === 'card-body' ? el.querySelector('.card-text-container') : el;
        if (graphicContainer) {
            if (el.clientWidth < this.graphicWrapWidth) {
                graphicContainer.className = 'card-text-container d-flex flex-wrap';
            } else {
                graphicContainer.className = 'card-text-container d-flex';
            }
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Home: typeof Home;
    }
}
