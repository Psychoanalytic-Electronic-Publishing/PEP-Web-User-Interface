import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import awsServerlessExpress from 'aws-serverless-express';
import expressServer from './server.js';
import ipSignatureManager from './ip.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emberDistPath = path.join(__dirname, 'dist');
const server = awsServerlessExpress.createServer(expressServer(emberDistPath));

export const handler = async (event, context) => {
    const sourceIp = event.requestContext?.identity?.sourceIp;

    if (sourceIp) {
        event.headers = event.headers || {};
        event.headers['x-client-ip'] = sourceIp;
        event.headers['x-client-ip-signature'] = await ipSignatureManager.generateSignature(sourceIp);
    }

    return awsServerlessExpress.proxy(server, event, context);
};
