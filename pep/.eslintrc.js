'use strict';

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['ember', '@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'prettier',
        'plugin:prettier/recommended'
    ],
    rules: {
        // Ember specific rules
        'ember/no-jquery': 'error',
        'ember/no-mixins': 'off',
        'ember/use-ember-data-rfc-395-imports': 'off',
        //@see http://eslint.org/docs/rules/no-var
        'no-var': 'error',
        //@see http://eslint.org/docs/rules/object-shorthand
        'object-shorthand': 'error',
        //@see http://eslint.org/docs/rules/prefer-template
        'prefer-template': 'error',
        'require-yield': 'off',
        'prefer-rest-params': 'off',

        // typescript
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',

        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    String: {
                        message: 'Use string instead',
                        fixWith: 'string'
                    },
                    Boolean: {
                        message: 'Use boolean instead',
                        fixWith: 'boolean'
                    },
                    Number: {
                        message: 'Use number instead',
                        fixWith: 'number'
                    },
                    Symbol: {
                        message: 'Use symbol instead',
                        fixWith: 'symbol'
                    },

                    Function: {
                        message: [
                            'The `Function` type accepts any function-like value.',
                            'It provides no type safety when calling the function, which can be a common source of bugs.',
                            'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
                            'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.'
                        ].join('\n')
                    },

                    // object typing
                    Object: {
                        message: [
                            'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
                            '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
                            '- If you want a type meaning "any value", you probably want `unknown` instead.'
                        ].join('\n')
                    },
                    '{}': {
                        message: [
                            '`{}` actually means "any non-nullish value".',
                            '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
                            '- If you want a type meaning "any value", you probably want `unknown` instead.'
                        ].join('\n')
                    }
                }
            }
        ],
        '@typescript-eslint/explicit-module-boundary-types': [
            'warn',
            {
                allowArgumentsExplicitlyTypedAsAny: true,
                allowDirectConstAssertionInArrowFunctions: true,
                allowedNames: [],
                allowHigherOrderFunctions: true,
                allowTypedFunctionExpressions: true
            }
        ],
        'prettier/prettier': 'error'
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
