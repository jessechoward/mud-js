const EventEmitter = require('events').EventEmitter;
const logger = require('../logging');
const flags = require('../flags');


const DescriptorState = new flags.FlagTable({name: 'DescriptorState', flags: ['unknown', 'connected', 'authenticating', 'creation', 'idle', 'closing', 'closed'], combinable: false});
exports.DescriptorState = DescriptorState;

class Descriptor extends EventEmitter
{
	constructor(id)
	{
		super();
		this.id = id;
		this._out_buffer = [];
		this._command_history = [];
		this._command_buffer = [];
		this._state = new flags.FlagValue(DescriptorState, 'unknown');
		this._idle = Date.now();
	}

	get state()
	{
		return this._state.value;
	}

	get idle()
	{
		return Date.now() - this._idle;
	}

	updateState(newState)
	{
		if (this.state !== newState)
		{
			this.emit('stateChange', this.state, newState);
			this._state.value = newState;
		}
	}

	pushCommand(command)
	{
		this._command_buffer.push(command);
		this._idle = Date.now();
	}

	// to be used by the game loop to get the next command from the player
	// one command at a time vs emitting events which could be susceptable to
	// a DoS type scenario
	get nextCommand()
	{
		const cmd = this._command_buffer.shift();
		if (cmd)
		{
			// there are certain states we don't want to log or emit
			// command history for security/privacy purposes
			if (['connected', 'idle', 'closing'].includes(this.state))
			{
				// keep a history of the last 20 commands - not their arguments
				// this should allow ![n] for POSIX style history repeating
				this._command_history.push(cmd);
				// manage the size of the command history
				// todo - make this configurable
				while(this._command_history.length > 50) this._command_history.shift();
				// check for spam
				// this is not meant to be used in the game loop
				// but for monitoring purposes such as monitoring a potential cheater.
				// Note - listening to this event should be a highly privileged task
				this.emit('command', {command: cmd, id: this.id});
			}
			
		}

		return cmd;
	}

	// buffer output to be handled
	// by the driver that extends Descriptor
	writeToBuffer(data)
	{
		try
		{
			this._out_buffer.push(JSON.stringify(data));
		}
		catch(error)
		{
			logger.error('Unable to JSON.stringify data', {error: error, data: data});
		}
	}

	get nextOutput()
	{
		const output = this._out_buffer.shift();
		if (output)
		{
			// there are certain states we don't want to share
			if (['connected', 'idle', 'closing'].includes(this.state))
			{
				// this is not meant to be used in the game loop
				// but for monitoring purposes such as monitoring a potential cheater.
				// Note - listening to this event should be a highly privileged task
				this.emit('output', {output: output, id: this.id});
			}
		}

		return output;
	}

	// drivers should override this to actually do something!
	sendNext()
	{
		logger.error('Trying to write to base class::Descriptor');
	}
};
exports.Descriptor = Descriptor;