require('dotenv').config();
const config = require('config');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const requestId = require('express-request-id');
const responseTime = require('response-time');
const WebsocketServer = require('./websocket/server');
const logger = require('./src/logging');

// log web-requests
const requestLogger = (req, res, next) =>
{
	// this is just a callback attached to the 'finish' event of the response
	// it is not middleware on the route itself
	res.on('finish', () =>
	{
		// set the log level to error initially
		let logLevel = 'error';
		// 2xx and 3xx are normal so they become debug level
		if (res.statusCode < 400) logLevel = 'debug';
		// 400 level are info because they may or may not be relevant
		else if (res.statusCode < 500) logLevel = 'info';
		// this leaves 500 level errors under the 'error' category
		// because they require attention

		logger[logLevel](res.statusMessage,
		{
			type: 'web-request',
			request:
			{
				protocol: req.protocol,
				path: req.path,
				code: res.statusCode,
				id: req.id,
				response_time: `${res._header['X-Response-Time']}`
			}
		});
	});
	// all we wanted to do was attach the 'finish' event handler to the response
	// this is always next()
	return next();
};

// the application
const app = express();

// make sure every request gets a response time header
// keep this as (one of) the first middleware pieces
// for accurate times
app.use(responseTime());
// make sure every request has an ID
app.use(requestId());
// request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// log all requests
// note this is done after our body parsing middleware
// and before our route handling
app.use(requestLogger);

// setup routes
const publicRoutes = express.static(path.join(__dirname, 'static'));
const apiRoutes = require(path.join(__dirname, 'routes', 'api'));

// public static routes to get the client
app.use('/', publicRoutes);
// routes for api access
app.use('/api', require(path.join(__dirname, 'routes', 'api')));

// start listening for connections
const server = app.listen(config.get('server.port'), config.get('server.address'), () =>
{
	logger.info('Server start', {address: server.address().address, port: server.address().port});
	// we can use the web server once it has actually started
	const websocketServer = new WebsocketServer(server);
});

module.exports = server;