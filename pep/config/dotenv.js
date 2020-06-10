/* eslint-env node */

'use strict';

const path = require('path');

module.exports = function(env) {
    return {
        clientAllowedKeys: [
            'ROOT_URL',
            'API_BASE_URL',
            'API_ERRORS_ENDPOINT',
            'ASSETS_BASE_URL',
            'FASTBOOT_WHITELIST_DOMAIN',
            'ROBOTS_DIST_PATH',
            'COGNITO_POOL_CLIENT_ID',
            'COGNITO_POOL_ID',
            'COGNITO_REGION',
            'COGNITO_COOKIE_DOMAIN',
            'COGNITO_COOKIE_PATH'
        ],
        fastbootAllowedKeys: [
            'ROOT_URL',
            'API_BASE_URL',
            'API_ERRORS_ENDPOINT',
            'ASSETS_BASE_URL',
            'FASTBOOT_WHITELIST_DOMAIN',
            'ROBOTS_DIST_PATH',
            'COGNITO_POOL_CLIENT_ID',
            'COGNITO_POOL_ID',
            'COGNITO_REGION',
            'COGNITO_COOKIE_DOMAIN',
            'COGNITO_COOKIE_PATH'
        ],
        failOnMissingKey: false,
        path: path.join(path.dirname(__dirname), `../.env-${process.env.DEPLOY_TYPE || env}`)
    };
};
