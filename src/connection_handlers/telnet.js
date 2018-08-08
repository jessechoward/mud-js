exports.Descriptor = class Descriptor
{
	constructor(socket)
	{
		this.socket = socket;
		this.in_buffer = '';
		this.commands = [];
		this.command_history = [];
		socket.on('data', (data) =>
		{
			this.in_buffer += data;
			this.processBuffer();
		});
		socket.on
	}
};