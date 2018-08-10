const EventEmitter = require('events').EventEmitter;
const logger = require('../logging');
const flags = require('../flags');


const DescriptorState = new flags.FlagTable({name: 'DescriptorState', flags: ['unknown', 'connected', 'idle', 'closing', 'closed'], combinable: false});
exports.DescriptorState = DescriptorState;

class Descriptor extends EventEmitter
{
	constructor(instance_id)
	{
		super();
		this.instance_id = instance_id;
		this._in_buffer = '';
		this._command_history = [];
		this._state = new flags.FlagValue(DescriptorState, 'unknown');
		this._resetIdleTimer();
	}

	_resetIdleTimer()
	{
		this._idle = Date.now();
		if (this._idleTimer) clearTimeout(this._idleTimer);
		this._idleTimer = setInterval(() =>
		{
			switch(this.state)
			{
				case 'idle':
					this.updateState('closing');
					logger.info('Closing descriptor due to idle state timeout', {descriptor: this.instance_id});
					break;
				default:
					this.updateState('idle');
					logger.info('Descriptor is going into idle state', {descriptor: this.instance_id});
					break;
			}
		}, 3000 /*3000 ms = 300 seconds = 5 minutes*/);

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
		this.command_history.push(command);
		this.emit('command', command);
		this._resetIdleTimer();
	}

	parseBuffer()
	{
		let newline = this.in_buffer.indexOf('\n');
		while(~newline)
		{
			const command = this.in_buffer.substring(0, newline);
			if (command.trim() === '') continue;

			this.pushCommand(command);
			this.in_buffer = this.in_buffer.substring(newline+1) || '';
			newline = this.in_buffer.indexOf('\n');
		}
	}
};
exports.Descriptor = Descriptor;