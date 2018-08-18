class MudConnection
{
	constructor()
	{
		this.socket = null;
	}

	get connected()
	{
		
		/**
		 * 0 - CONNECTING
		 * 1 - OPEN
		 * 2 - CLOSING
		 * 3 - CLOSED
		 */
		return this.socket && this.socket.readyState == 1 ? true : false;
	}

	close(code, reason)
	{
		if (this.socket)
		{
			console.log('Closing the socket');
			// handle the cleanup in the closed handler
			this.socket.close(code, reason);
		}
	}

	connect()
	{
		this.socket = new WebSocket('ws://localhost:5000/websocket');
		this.socket.addEventListener('message', this.handleMessage.bind(this));
		this.socket.addEventListener('open', this.handleOpen.bind(this));
		this.socket.addEventListener('close', this.handleClose.bind(this));
		this.socket.addEventListener('error', this.handleError.bind(this));
	}

	send(text)
	{
		if (this.connected)
		{
			console.log('sending data: ', text);
			this.socket.send(text);
		}
	}

	handleMessage(event)
	{
		$('#terminal-output').append(`<p>${event.data}</p>`);
		console.log('received data: ', event.data || event);
	}

	handleOpen(event)
	{
		$('#terminal-output').trigger('connectionOpen', ['open']);
		console.log('Client connection open: ', event);
	}

	handleClose(event)
	{
		$('#toggle-connection').text('closing connection');
		$('#toggle-connection').prop('disabled', true);
		$('#terminal-output').trigger('connectionClosed', ['closed']);
		console.log('Client connection closed: ', event);
	}

	handleError(event)
	{
		console.log('Socket error: ', event);
	}
};

function handleNoConnection()
{
	const style = ['background-color: red', 'color: white', 'font-weight-bold'];
	const message = 'No connection found! You must connect to the MUD first.';
	$('#terminal-output').append(`<p><span style="${style.join(';')}">${message}</span></p>`);
};

function handleLogin(data)
{
	$.ajax(
	{
		url: '/api/login',
		method: 'POST',
		json: true,
		data: data
	})
	.done((data, textStatus, jqxhr) =>
	{
		console.log('login response: (%s) "%s"', textStatus, data);
	})
	.fail((jqxhr, textStatus, errorThrown) =>
	{
		console.log('login response: (%s) "%s"', textStatus, errorThrown);
	});
};

$(document).ready(() =>
{
	$("form").submit(function (event)
	{
		switch(this.id)
		{
			case 'login-form':
				handleLogin($(this).serializeArray());
				break;
			default:
				console.log('no handler for form: ', this.id);
				break;
		}
		event.preventDefault();
	});

	var mud = new MudConnection();

	$('#terminal-output').on('connectionOpen', () =>
	{
		console.log('connectionOpen triggered');
		setTimeout(() =>
		{
			$('#toggle-connection').prop('disabled', false);
			$('#toggle-connection').text('Disonnect');
		}, 2000);
	});

	$('#terminal-output').on('connectionClosed', () =>
	{
		console.log('connectionClosed triggered');
		setTimeout(() =>
		{
			$('#toggle-connection').prop('disabled', false);
			$('#toggle-connection').text('Connect');
		}, 2000);
	});

	$('#toggle-connection').click((event) =>
	{
		// don't allow re-clicking until the connection state has changed
		$('#toggle-connection').text(mud.connected ? 'closing connection' : 'initiating connection');
		$('#toggle-connection').prop('disabled', true);
		if (!mud.connected) mud.connect();
		else mud.close();
	});

	// collect user input
	$('#user-input').keyup((event) =>
	{
		if (event.keyCode == 13)
		{
			if (mud.connected) mud.send($('#user-input').val());
			else handleNoConnection();
			// clear the input
			$('#user-input').val('');
		}	
	});
});