const app = require('express')();
const bodyParser = require('body-parser');
const jwt = require('jwt');
const Ws = require('ws');

const secret = process.env.JWT_SECRET || 'changeme';

const ClientHandler = require('./connection_handlers/websocket');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const WsServer = new Ws.Server(
{
	server: app,
	verifyClient: (info) =>
	{
		if (info.req.headers.authorization)
		{
			if (jwt.verify())
		}
	}
});