/* eslint-env node */

'use strict';

const path = require('path');

module.exports = function(env) {
    return {
        clientAllowedKeys: [
            'BUILD_VERSION',
            'USER_PREFERENCES_VERSION',
            'ROOT_URL',
            'API_BASE_URL',
            'API_NAMESPACE',
            'API_DATA_NAMESPACE',
            'API_ADMIN_NAMESPACE',
            'API_ERRORS_ENDPOINT',
            'ASSETS_BASE_URL',
            'FASTBOOT_WHITELIST_DOMAIN',
            'ROBOTS_DIST_PATH',
            'CLIENT_ID',
            'COOKIE_DOMAIN',
            'COOKIE_SECURE',
            'COOKIE_SAME_SITE'
        ],
        fastbootAllowedKeys: [
            'BUILD_VERSION',
            'USER_PREFERENCES_VERSION',
            'ROOT_URL',
            'API_BASE_URL',
            'API_NAMESPACE',
            'API_DATA_NAMESPACE',
            'API_ADMIN_NAMESPACE',
            'API_ERRORS_ENDPOINT',
            'ASSETS_BASE_URL',
            'FASTBOOT_WHITELIST_DOMAIN',
            'ROBOTS_DIST_PATH',
            'CLIENT_ID',
            'COOKIE_DOMAIN',
            'COOKIE_SECURE',
            'COOKIE_SAME_SITE'
        ],
        failOnMissingKey: false,
        path: path.join(path.dirname(__dirname), `../.env-${process.env.DEPLOY_TYPE || env}`)
    };
};
