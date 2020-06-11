'use strict';

module.exports = {
    extends: ['octane', '@gavant/ember-template-lint-forms:forms'],
    plugins: ['@gavant/ember-template-lint-forms'],
    rules: {
        'self-closing-void-elements': false,
        'no-bare-strings': false, //['&copy', '&nbsp'], //TODO reenable this in real app!!!
        'block-indentation': 4,
        'attribute-indentation': {
            indentation: 4,
            'open-invocation-max-len': 120
        }
    }
};
