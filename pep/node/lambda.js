const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const awsServerlessExpress = require('aws-serverless-express');
const expressServer = require('./server.js');
const ipSignatureManager = require('./ip.js');

const emberDistPath = path.join(__dirname, 'dist');
let serverlessExpressInstance;

const setupServer = async (event, context) => {
    const server = awsServerlessExpress.createServer(expressServer(emberDistPath));
    serverlessExpressInstance = (e, c) => awsServerlessExpress.proxy(server, e, c);

    return handleRequest(event, context);
};

const handleRequest = async (event, context) => {
    const sourceIp = event.requestContext?.identity?.sourceIp;

    if (sourceIp) {
        event.headers = event.headers || {};
        event.headers['x-client-ip'] = sourceIp;
        event.headers['x-client-ip-signature'] = await ipSignatureManager.generateSignature(sourceIp);

        console.log('IP Headers added:', {
            sourceIp: event.headers['x-client-ip'],
            signature: event.headers['x-client-ip-signature']
        });
    } else {
        console.log('No source IP found in event');
    }

    return serverlessExpressInstance(event, context);
};

// Using async setup pattern
// https://github.com/CodeGenieApp/serverless-express/blob/mainline/README.md#async-setup-lambda-handler
exports.handler = (event, context) => {
    if (serverlessExpressInstance) {
        return handleRequest(event, context);
    }
    return setupServer(event, context);
};
