import { registerDeprecationHandler } from '@ember/debug';

const ignoredDeprecations = [
    'meta-destruction-apis' // removal: 3.25.0
];

/**
 * Application initializer that silences specific deprecations that we dont care about
 */
export function initialize() {
    registerDeprecationHandler((message, options, next) => {
        if (options?.id && ignoredDeprecations.includes(options.id)) {
            return;
        } else {
            //@ts-ignore
            next(message, options);
        }
    });
}

export default {
    name: 'ignored-deprecations',
    initialize
};
