'use strict';

module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            legacyDecorators: true
        }
    },
    plugins: ['ember', 'prettier'],
    extends: ['eslint:recommended', 'plugin:ember/recommended'],
    env: {
        browser: true
    },
    rules: {
        'ember/no-jquery': 'error',
        //@see http://eslint.org/docs/rules/no-var
        'no-var': 'error',
        //@see http://eslint.org/docs/rules/object-shorthand
        'object-shorthand': 'error',
        //@see http://eslint.org/docs/rules/prefer-template
        'prefer-template': 'error',
        'prettier/prettier': 'error'
    },
    globals: {
        PerfectScrollbar: true
    },
    overrides: [
        // node files
        {
            files: [
                '.eslintrc.js',
                '.template-lintrc.js',
                'ember-cli-build.js',
                'testem.js',
                'blueprints/*/index.js',
                'config/**/*.js',
                'lib/*/index.js',
                'server/**/*.js',
                'node/**/*.js'
            ],
            parserOptions: {
                sourceType: 'script'
            },
            env: {
                browser: false,
                node: true
            },
            plugins: ['node'],
            rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
                // add your custom rules and overrides for node files here

                // this can be removed once the following is fixed
                // https://github.com/mysticatea/eslint-plugin-node/issues/77
                'node/no-unpublished-require': 'off'
            })
        }
    ]
};
