'use strict';

module.exports = {
    extends: ['octane', '@gavant/ember-template-lint-forms:forms', 'ember-template-lint-plugin-prettier:recommended'],
    plugins: ['ember-template-lint-plugin-prettier', '@gavant/ember-template-lint-forms'],
    rules: {
        'self-closing-void-elements': false,
        'no-bare-strings': ['&copy', '&nbsp', '.'],
        'block-indentation': 4,
        'attribute-indentation': {
            indentation: 4,
            'open-invocation-max-len': 120
        },
        'no-curly-component-invocation': false
    }
};
