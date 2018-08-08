const EventEmitter = require('events').EventEmitter;
const logger = require('../logging');
const flags = require('../flags');


exports.DescriptorState = new flags.FlagTable();

exports.Descriptor = class Descriptor extends EventEmitter
{
	constructor(instance_id)
	{
		super();
		this.instance_id = instance_id;
		this.in_buffer = '';
		this.command_history = [];
		this.state = this._updateState(DescriptorState.CONNECTING);
	}

	get stateName()
	{
		_.
	}
	_descriptorStatus()
	{
		return {id: instance_id, state: }
	}
	_parseBuffer()
	{
		let newline = this.in_buffer.indexOf('\n');
		while(~newline)
		{
			const command = this.in_buffer.substring(0, newline);
			this.pushCommand(command);
			this.in_buffer = this.in_buffer.substring(newline+1);
			newline = this.in_buffer.indexOf('\n');
		}
	}

	pushCommand(command)
	{
		this.command_history.push(command);
		this.emit('command', command);
	}
};