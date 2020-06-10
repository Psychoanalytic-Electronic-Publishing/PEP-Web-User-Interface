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
    apiBaseUrl: string;
    cognito: {
        userPoolWebClientId: string;
        userPoolId: string;
        region: string;
        cookieStorage: {
            domain: string;
            path: string;
            expires: number;
            secure: boolean;
        };
    };
};
