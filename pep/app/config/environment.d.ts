export default config;

/**
 * Type declarations for
 *    import config from './config/environment'
 *
 * For now these need to be managed by the developer
 * since different ember addons can materialize new entries.
 */
declare const config: {
    environment: string;
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
    federatedLoginUrl: string;
    clientId: number;
    cookieDomain: string;
    cookieSecure: boolean;
    cookieSameSite: string;
    reportsBaseUrl: string;
    sig: {
        AWS_SESSION_TOKEN: string;
        IP_HMAC_SECRET_ARN: string;
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: string;
    };
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
    disqus: {
        shortname: string;
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
    APP: Record<string, unknown>;
};
