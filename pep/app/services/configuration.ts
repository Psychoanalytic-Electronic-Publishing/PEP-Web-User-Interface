import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { hash } from 'rsvp';

import ENV from 'pep/config/environment';
import LangService from 'pep/services/lang';
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
     * Initialize the app by loading the applicable base and
     * language-specific configurations
     */
    async setup() {
        try {
            const contentConfigName = `${CONTENT_CONFIG_NAME}-${this.lang.currentLanguage}`;
            // TODO re-enable this once the configuration endpoints/data are live/populated
            // const base = this.store.queryRecord('configuration', { configname: BASE_CONFIG_NAME });
            // const content = this.store.queryRecord('configuration', { configname: contentConfigName });

            // TODO remove this once the configuration endpoints/data are live/populated
            this.store.pushPayload('user', {
                configuration: [
                    {
                        configName: BASE_CONFIG_NAME,
                        clientID: ENV.clientId,
                        configSettings: DEFAULT_BASE_CONFIGURATION
                    },
                    {
                        configName: contentConfigName,
                        clientID: ENV.clientId,
                        configSettings: DEFAULT_CONTENT_CONFIGURATION
                    }
                ]
            });
            const base = this.store.peekRecord('configuration', BASE_CONFIG_NAME)!;
            const content = this.store.peekRecord('configuration', contentConfigName)!;

            const configs = await hash({ base, content });
            this.base = configs.base.configSettings as BaseConfiguration;
            this.content = configs.content.configSettings as ContentConfiguration;
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
