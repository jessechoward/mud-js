const logger = require('../logging');
const descriptor = require('./descriptor');

// non printable characters we don't want to accept as input
// ascii chars 0-7, 11-31, and 128-255
// note that this includes carriage returns '\r' which while valid
// (used in windows and for various other text protocols like html...)
// aren't useful for our purposes at this time but this could change...
const invalidChars = /[\x00-\x08\x0B-\x1F\x80-\xFF]/g;

const normalizeData = (data) =>
{
	return data.replace(invalidChars, '');
};

class WebSocket extends descriptor.Descriptor
{
	constructor(ws, request)
	{
		super(request.headers['x-mud-session']);
		this._ws = ws;
		this._writing = false;

		this._ws.on('message', (data) =>
		{
			try
			{
				this.pushCommand(JSON.parse(normalizeData(data)));
			}
			catch(error)
			{
				logger.error('Client sent non parsable JSON', {error: error, id: this.id});
			}
		});

		this._ws.on('error', (error) =>
		{
			// these usually aren't errors
			// at some point we should get better at this
			logger.info('Websocket error: ', {error: error});
			this.updateState('closing');
			this.close('websocket error received');
		});

		this._ws.on('close', (code, reason) =>
		{
			logger.info('Websocket closed', {code: code, reason: reason});
			this.updateState('closed');
		});

		this._ws.on('ping', (data) =>
		{
			logger.debug('Websocket ping received', {id: this.id, data: data});
			this._ws.pong(data);
		});

		this._ws.on('pong', (data) =>
		{
			logger.debug('Websocket pong received', {id: this.id, data: data});
		});
	}

	sendNext()
	{
		if (!this._writing)
		{
			const output = this.nextOutput;
			if (output)
			{
				this._writing = true;
				this._ws.send(output, 'utf8', () =>
				{
					this.writing = false;
				});
			}
		}
	}

	close(reason)
	{
		logger.info('Application requesting to close connection', {reason: reason || 'undefined'});
		this.updateState('closing');
		this._ws.terminate();
	}
};

module.exports = WebSocket;