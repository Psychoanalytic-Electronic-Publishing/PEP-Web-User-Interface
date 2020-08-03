/* eslint-env node */

'use strict';

const path = require('path');

module.exports = function(env) {
    return {
        clientAllowedKeys: [
            'ROOT_URL',
            'API_BASE_URL',
            'API_NAMESPACE',
            'API_DATA_NAMESPACE',
            'API_ERRORS_ENDPOINT',
            'ASSETS_BASE_URL',
            'FASTBOOT_WHITELIST_DOMAIN',
            'ROBOTS_DIST_PATH'
        ],
        fastbootAllowedKeys: [
            'ROOT_URL',
            'API_BASE_URL',
            'API_NAMESPACE',
            'API_DATA_NAMESPACE',
            'API_ERRORS_ENDPOINT',
            'ASSETS_BASE_URL',
            'FASTBOOT_WHITELIST_DOMAIN',
            'ROBOTS_DIST_PATH'
        ],
        failOnMissingKey: false,
        path: path.join(path.dirname(__dirname), `../.env-${process.env.DEPLOY_TYPE || env}`)
    };
};
