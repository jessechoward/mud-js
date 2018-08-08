const os = require('os');
const Winston = require('winston');
const pkg = require('../package.json');

// reusable addition to transports
// to add application runtime details
const appData = Winston.format((info) =>
{
	info.app_data =
	{
		name: pkg.name,
		version: pkg.version,
		hostname: os.hostname(),
		pid: process.pid,
		uptime: process.uptime(),
	};

	return info;
});

const logger = Winston.createLogger(
{
	// syslog level names
	levels: Winston.config.syslog.levels,
	// default logging level - supports environment variable overrides
	level: process.env.LOG_LEVEL || 'info',
	// silent mode - useful for testing
	silent: process.env.MUTE_LOGGING || false,
	transports:
	[
		new Winston.transports.Console(
		{
			format: Winston.format.combine(
				Winston.format.json(),
				Winston.format.timestamp(),
				// custom app data added to every log entry
				appData()
			)
		})
	]
});

module.exports = logger;