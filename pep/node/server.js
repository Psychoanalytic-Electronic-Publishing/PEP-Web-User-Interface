'use strict';

const fastbootMiddleware = require('fastboot-express-middleware');
const express = require('express');
const server = express();

module.exports = function(emberDistPath) {
    //common files served from the site root
    server.all('/robots.txt', (req, res) => {
        res.sendFile(`${emberDistPath}${process.env.ROBOTS_DIST_PATH || '/robots-development.txt'}`);
    });
    server.all('/favicon.ico', (req, res) => {
        res.sendFile(`${emberDistPath}/favicon.ico`);
    });

    server.all(
        '/*',
        fastbootMiddleware({
            distPath: emberDistPath,
            //resilient mode = true swallows rendering errors and returns a 200 w/the default index.html
            resilient: false
        })
    );

    return server;
};
