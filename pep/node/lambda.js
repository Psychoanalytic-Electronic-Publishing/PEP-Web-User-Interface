const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const awsServerlessExpress = require('aws-serverless-express');
const expressServer = require('./server.js');

const emberDistPath = path.join(__dirname, 'dist');
const server = awsServerlessExpress.createServer(expressServer(emberDistPath));

exports.handler = (event, context) => {
    const sourceIp = event.requestContext?.identity?.sourceIp;
    if (sourceIp) {
        event.headers = event.headers || {};
        event.headers['client-ip'] = sourceIp;
    }

    return awsServerlessExpress.proxy(server, event, context);
};
