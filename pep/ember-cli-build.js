'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    let app = new EmberApp(defaults, {
        fingerprint: {
            prepend: process.env.ASSETS_BASE_URL
        },
        outputPaths: {
            app: {
                css: {
                    app: '/assets/pep.css',
                    'themes/tomato': '/assets/themes/tomato.css'
                }
            }
        },
        sassOptions: {
            includePaths: [
                'node_modules/ember-basic-dropdown/app/styles',
                'node_modules/ember-power-select/app/styles',
                'node_modules/@gavant/ember-floating-labels/app/styles',
                'node_modules/@gavant/ember-bootstrap-dropdown/app/styles',
                'node_modules/@gavant/ember-button-spinner/app/styles'
            ]
        },
        autoprefixer: {
            browsers: [
                'Chrome >= 60',
                'Firefox >= 60',
                'Edge >= 12',
                'Explorer >= 11',
                'iOS >= 10',
                'Safari >= 10',
                'Android >= 6'
            ]
        },
        //needs to be disabled to run app from local filesystem
        //TODO remove this once it becomes a real app
        SRI: {
            enabled: false,
            runsIn: [],
            crossorigin: 'anonymous'
        }
    });

    // Use `app.import` to add additional libraries to the generated
    // output files.
    //
    // If you need to use different assets in different
    // environments, specify an object as the first parameter. That
    // object's keys should be the environment name and the values
    // should be the asset to use in that environment.
    //
    // If the library that you are including contains AMD or ES6
    // modules that you would like to import into your application
    // please specify an object with the list of modules as keys
    // along with the exports of each module as its value.

    //@see https://github.com/jasonmit/ember-cli-moment-shim/issues/165
    app.import('node_modules/moment/moment.js', { using: [{ transformation: 'amd', as: 'moment' }] });

    app.import('node_modules/animate.css/animate.min.css');

    return app.toTree();
};
