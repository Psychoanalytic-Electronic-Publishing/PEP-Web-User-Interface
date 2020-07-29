import { registerDeprecationHandler } from '@ember/debug';

const ignoredDeprecations = [
    'meta-destruction-apis' // removal: 3.25.0
];

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

export default { initialize };
