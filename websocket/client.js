const logger = require('../src/logging');

class WebsocketClient
{
	constructor(socket)
	{
		this.socket = socket;
		this.socket.on('message', this.handleMessage.bind(this));
		this.socket.on('error', this.handleError.bind(this));
		this.socket.on('close', this.handleClose.bind(this));
	}

	handleError(error)
	{
		logger.info('Client connection error', {error: error});
	}

	handleClose(code, reason)
	{
		logger.info('Client connection closing', {code: code, reason: reason});
	}

	handleMessage(message)
	{
		logger.debug('Client sent message', {client_message: message});
		// echo the message
		this.socket.send(message);
	}

	send(message)
	{
		this.socket.send(message);
	}
}

module.exports = WebsocketClient;