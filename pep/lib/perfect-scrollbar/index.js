/* eslint-env node */
'use strict';

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const map = require('broccoli-stew').map;

module.exports = {
    name: 'perfect-scrollbar',

    treeForVendor(defaultTree) {
        let trees = [];

        if (defaultTree) {
            trees.push(defaultTree);
        }

        let browserVendorLib = new Funnel('node_modules/perfect-scrollbar/dist', {
            files: ['perfect-scrollbar.js'],
            destDir: 'perfect-scrollbar'
        });
        browserVendorLib = map(browserVendorLib, (content) => `if (typeof FastBoot === 'undefined') { ${content} }`);
        trees.push(browserVendorLib);

        return new mergeTrees(trees);
    },

    included(app) {
        this._super.included.apply(this, arguments);
        // this file will be loaded in FastBoot but will not be eval'd
        app.import('vendor/perfect-scrollbar/perfect-scrollbar.js');
    }
};
