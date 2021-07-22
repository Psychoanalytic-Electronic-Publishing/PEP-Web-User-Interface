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

    server.all(
        '/*',
        fastbootMiddleware({
            distPath: emberDistPath,
            //resilient mode = true swallows rendering errors and returns a 200 w/the default index.html
            resilient: true
        })
    );

    return server;
};
