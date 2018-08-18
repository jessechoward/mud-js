const router = require('express').Router();
const logger = require('../src/logging');
const ws = require('ws');
const Client = require('./client');

class WebsocketServer
{
	constructor(webServer)
	{
		try
		{
			this.socket = new ws.Server({server: webServer});
			this.socket.on('error', this.errorHandler.bind(this));
			this.socket.on('connection', this.connectionHandler.bind(this));
			this.socket.on('close', this.closeHandler.bind(this));
			this.socket.on('listening', this.listeningHandler.bind(this));
		}
		catch(error)
		{
			logger.error('Error initializing websocket server', {error: error});
		}
	}

	listeningHandler()
	{
		logger.info('WebsocketServer listening');
	}

	errorHandler(error)
	{
		logger.error('WebscketServer Error', {error: error});
		this.socket.close(error);
	}

	connectionHandler(clientSock, req)
	{
		logger.debug('New client connection', {headers: req.headers});
		const client = new Client(clientSock);
		client.send('Welcome!');
	}

	closeHandler(code, reason)
	{
		logger.info('WebsocketServer closed', {code: code, reason: reason});
	}
}

module.exports = WebsocketServer;