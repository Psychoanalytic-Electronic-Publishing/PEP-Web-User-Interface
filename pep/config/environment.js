'use strict';

module.exports = function (environment) {
    console.log('environment:', environment);
    console.log('process.env:', process.env);

    let ENV = {
        modulePrefix: 'pep',
        podModulePrefix: 'pep/pods',
        environment,
        //@see https://blog.emberjs.com/2016/04/28/baseurl ("Configuring the Router" section)
        rootURL: '/',
        routerRootURL: process.env.ROOT_URL,
        locationType: 'auto',

        EmberENV: {
            LOG_STACKTRACE_ON_DEPRECATION: false,
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
            },
            EXTEND_PROTOTYPES: {
                // Prevent Ember Data from overriding Date.parse.
                Date: false
            }
        },

        APP: {
            googleAnalytics: process.env.GOOGLE_ANALYTICS_ID || ''
        },

        fontawesome: {
            defaultPrefix: 'fal'
        },

        'ember-cli-notifications': {
            autoClear: true,
            clearDuration: 3500
        },

        'ember-error-tracker': {
            maxLogStackSize: 10,
            events: false,
            listeners: {
                window: true,
                ember: {
                    rsvp: true,
                    ember: true,
                    actions: true
                }
            },
            consumers: {
                console: true,
                api: false
            }
        },

        'ember-cli-head': {
            suppressBrowserRender: true
        },

        fastboot: {
            hostWhitelist: [new RegExp(process.env.FASTBOOT_WHITELIST_DOMAIN), /^localhost:\d+$/]
        },

        pageTitle: {
            prepend: false
        },

        storefront: {
            maxAge: 10
        },

        disqus: {
            shortname: process.env.DISQUS_SHORTNAME
        },

        //deployment environment-specific variables
        buildVersion: process.env.BUILD_VERSION,
        userPreferencesVersion: process.env.USER_PREFERENCES_VERSION,
        authBaseUrl: process.env.AUTH_BASE_URL,
        apiBaseUrl: process.env.API_BASE_URL,
        apiNamespace: process.env.API_NAMESPACE,
        apiDataNamespace: process.env.API_DATA_NAMESPACE,
        apiAdminNamespace: process.env.API_ADMIN_NAMESPACE,
        assetBaseUrl: process.env.ASSETS_BASE_URL,
        clientId: process.env.CLIENT_ID,
        cookieDomain: process.env.COOKIE_DOMAIN,
        cookieSecure: Number(process.env.COOKIE_SECURE) === 1,
        cookieSameSite: process.env.COOKIE_SAME_SITE,
        federatedLoginUrl: process.env.FEDERATED_LOGIN_URL,
        reportsBaseUrl: process.env.REPORTS_API,

        // For HMAC authentication
        AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
        IP_HMAC_SECRET_ARN: process.env.IP_HMAC_SECRET_ARN,
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
        ENV.APP.autoboot = false;
    }

    return ENV;
};
