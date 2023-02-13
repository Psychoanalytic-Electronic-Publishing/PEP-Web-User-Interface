'use strict';

const path = require('path');

// load environment variables from project-name/node/.env
require('dotenv').config({ path: path.join(__dirname, '.env') });

//path to the built production ember application distribution folder
const emberDistPath = path.join(__dirname, 'dist');

//@see https://github.com/awslabs/aws-serverless-express
const awsServerlessExpress = require('aws-serverless-express');
const expressServer = require('./server');
const server = awsServerlessExpress.createServer(expressServer(emberDistPath));

// Uncomment to run locally
// server.listen(3000, () => {
//     console.log(`Server listening on port 3000`);
// });

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
