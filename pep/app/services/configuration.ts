import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { hash } from 'rsvp';
import merge from 'lodash.merge';

import ENV from 'pep/config/environment';
import LangService from 'pep/services/lang';
import { SEARCH_DEFAULT_VIEW_PERIOD, SEARCH_DEFAULT_FACETS } from 'pep/constants/search';
import {
    BaseConfiguration,
    ContentConfiguration,
    DEFAULT_BASE_CONFIGURATION,
    DEFAULT_CONTENT_CONFIGURATION,
    BASE_CONFIG_NAME,
    CONTENT_CONFIG_NAME
} from 'pep/constants/configuration';

export default class ConfigurationService extends Service {
    @service store!: DS.Store;
    @service lang!: LangService;

    @tracked base: BaseConfiguration = DEFAULT_BASE_CONFIGURATION;
    @tracked content: ContentConfiguration = DEFAULT_CONTENT_CONFIGURATION;

    /**
     * The `configname` of the config record to fetch for language-dependent
     * configuration data, e.g. "pep-content-en-us" for English
     * @readonly
     * @returns {string}
     */
    get contentConfigName() {
        return `${CONTENT_CONFIG_NAME}-${this.lang.currentLanguage}`;
    }

    /**
     * The default query param values for a "blank" search page, based on the
     * current user prefs/admin configs. Can be used for <LinkTo>'s `@query` arg
     * @readonly
     * @returns {object}
     */
    get defaultSearchParams() {
        return {
            q: '',
            matchSynonyms: false,
            citedCount: '',
            viewedCount: '',
            viewedPeriod: SEARCH_DEFAULT_VIEW_PERIOD,
            searchTerms: null,
            facets: JSON.stringify(SEARCH_DEFAULT_FACETS)
        };
    }

    /**
     * Initialize the app by loading the applicable base and
     * language-specific configurations
     */
    async setup() {
        try {
            // TODO re-enable this once the configuration endpoints/data are live/populated
            // const base = this.store.queryRecord('configuration', { configname: BASE_CONFIG_NAME });
            // const content = this.store.queryRecord('configuration', { configname: this.contentConfigName });

            // TODO remove this once the configuration endpoints/data are live/populated
            this.store.pushPayload('configuration', {
                configuration: [
                    {
                        configName: BASE_CONFIG_NAME,
                        clientID: ENV.clientId,
                        configSettings: DEFAULT_BASE_CONFIGURATION
                    },
                    {
                        configName: this.contentConfigName,
                        clientID: ENV.clientId,
                        configSettings: DEFAULT_CONTENT_CONFIGURATION
                    }
                ]
            });
            const base = this.store.peekRecord('configuration', BASE_CONFIG_NAME)!;
            const content = this.store.peekRecord('configuration', this.contentConfigName)!;

            const configs = await hash({ base, content });
            const contentCfg = configs.content.configSettings;
            const baseCfg = configs.base.configSettings;
            // merge the returned configs with the default config values
            // to ensure the app can always safely access config data
            // e.g. even if a new version is released w/new configs that
            // do not yet exist in the saved config records
            this.base = merge({}, baseCfg, DEFAULT_BASE_CONFIGURATION) as BaseConfiguration;
            this.content = merge({}, contentCfg, DEFAULT_CONTENT_CONFIGURATION) as ContentConfiguration;
        } catch (err) {
            // if configs fail to load, fall back to the default config values
            this.base = DEFAULT_BASE_CONFIGURATION;
            this.content = DEFAULT_CONTENT_CONFIGURATION;
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        configuration: ConfigurationService;
    }
}
