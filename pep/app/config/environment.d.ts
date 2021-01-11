export default config;

/**
 * Type declarations for
 *    import config from './config/environment'
 *
 * For now these need to be managed by the developer
 * since different ember addons can materialize new entries.
 */
declare const config: {
    environment: any;
    modulePrefix: string;
    podModulePrefix: string;
    locationType: string;
    rootURL: string;
    routerRootURL: string;
    userPreferencesVersion: string;
    buildVersion: string;
    apiBaseUrl: string;
    apiNamespace: string;
    apiDataNamespace: string;
    apiAdminNamespace: string;
    assetBaseUrl: string;
    authBaseUrl: string;
    clientId: number;
    cookieDomain: string;
    cookieSecure: boolean;
    cookieSameSite: string;
    reportsBaseUrl: string;
    fastboot: {
        hostWhitelist: Array<string | RegExp>;
    };
    pageTitle: {
        prepend: boolean;
    };
    fontawesome: {
        defaultPrefix: string;
    };
    storefront: {
        maxAge: number;
    };
    'ember-cli-notifications': {
        autoClear: boolean;
        clearDuration: number;
    };
    'ember-error-tracker': {
        maxLogStackSize: number;
        events: boolean;
        listeners: {
            window: boolean;
            ember: {
                rsvp: boolean;
                ember: boolean;
                actions: boolean;
            };
        };
        consumers: {
            console: boolean;
            api: boolean;
        };
    };
    metricsAdapters: [
        {
            name: string;
            environments: string[];
            config: {
                id: string;
                debug: boolean;
                trace: boolean;
                sendHitTask: boolean;
            };
        }
    ];
};
