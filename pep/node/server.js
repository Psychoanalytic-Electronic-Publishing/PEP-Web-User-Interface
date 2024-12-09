'use strict';

const fastbootMiddleware = require('fastboot-express-middleware');
const express = require('express');
const server = express();
const FastBoot = require('fastboot');
const { createHmac } = require('crypto');

module.exports = function (emberDistPath) {
    // Uncomment to run locally
    // server.all('/translations/*', function(req, res, next) {
    //     res.sendFile(`${emberDistPath}${req.url}`);
    // });

    //common files served from the site root
    server.all('/robots.txt', (req, res) => {
        res.sendFile(`${emberDistPath}${process.env.ROBOTS_DIST_PATH || '/robots-development.txt'}`);
    });
    server.all('/favicon.ico', (req, res) => {
        res.sendFile(`${emberDistPath}/assets/images/favicons/favicon.ico`);
    });

    server.all('/toc.php', (req, res) => {
        const journal = req.query.journal;
        const volume = req.query.volume;
        if (volume) {
            res.redirect(301, `/browse/${journal}/volumes/${volume}`);
        } else {
            res.redirect(301, `/browse/${journal}/volumes`);
        }
    });

    server.all('/document.php', (req, res) => {
        const id = req.query.id;
        res.redirect(301, `/browse/document/${id}`);
    });

    // Uncomment to run locally
    // server.all('/assets/*', (req, res) => {
    //     // console.log(req.url)
    //     res.sendFile(`${emberDistPath}${req.url}`);
    // });
    // server.all('/*', (req, res) => {
    //     console.log(req.url);
    //     res.sendFile(`${emberDistPath}/index.html`);
    // });

    const fastboot = new FastBoot({
        distPath: emberDistPath,
        resilient: true, // swallow rendering errors

        // Required params for signature generation
        buildSandboxGlobals(defaultGlobals) {
            return Object.assign({}, defaultGlobals, {
                process: {
                    env: {
                        AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
                        IP_HMAC_SECRET_ARN: process.env.IP_HMAC_SECRET_ARN,
                        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT:
                            process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT || 2773
                    }
                },
                createHmac
            });
        }
    });

    server.all(
        '/*',
        fastbootMiddleware({
            fastboot
        })
    );

    return server;
};
