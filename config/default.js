const ms = require('ms');

module.exports = {
	server:
	{
		// default is listen on localhost
		// probably behind a reverse proxy like nginx/haproxy
		// to provide SSL/TLS termination
		address: 'localhost',
		// default port
		// keep in mind anything <= 1024 is reserved
		// and would require this application to be run with root
		// privileges which is not recommended
		port: 5000,
		// default log level is debug
		// probably want to turn this down to at least 'info'
		// or even 'warning' if you aren't actively developing
		// as debug can be fairly verbose
		log_level: 'debug'
	},
	database:
	{
		// default is sqlite3 for development
		// however you probably want to use mysql
		// or postgres in production
		dialect: 'sqlite3',
		// this is only useful for sqlite3
		// and is ignored for other drivers
		storage: './mudjs.db',
		database: 'mudjs',
		logging: 'debug',
		sync:
		{
			// setting this to true will drop the table if it exists
			// which probably isn't what you want unless you are starting
			// from scratch
			force: false,
			// you may want to turn this on if you are making
			// lots of schema changes
			alter: false
		}
	},
	keys:
	{
		// this should be unnecessary however
		// if you want to use existing keys set this to true
		// and point the public/private settings at the fully
		// qualified path of the keys
		absolute_path: false,
		// You will need to change these after you run
		// <project root>/keys/gen_keys.sh each time
		public: 'rsa_pub.pem',
		private: 'rsa_priv.pem'
	},
	jsonwebtoken:
	{
		// default signing options
		// https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
		// we are using priv/pub key pairs for signing so use the RS algorithms for signing
		// be sure to expire tokens in a reasonable amount of time.
		sign:
		{
			algorithm: 'RS256',
			expiresIn: ms('4h'),
			issuer: 'mudjs'
		},
		verify:
		{
			// this should match the algorithm used to sign
			algorithms: ['RS256'],
			// we should always check if the token is expired
			ignoreExpiration: false,
			// needs to be the same as the signer
			issuer: 'mudjs',
			// this should match the expiresIn time
			maxAge: ms('4h')
		},
		// the key for the sorted set of revoked jwtIds
		revoked_cache_key: 'jwt_revoked',
		// clean up the cache for expired items every 15 minutes
		revoked_cache_cleanup: ms('15m')
	},
	cache:
	{
		// 4 hour TTL
		default_ttl: 60*60*4,
		/**
		 * Options for redis.createClient are passed directly
		 * https://www.npmjs.com/package/redis#options-object-properties
		 * The basic defaults are here
		 */
		redis:
		{
			/**
			 * Probably want to add a username/password in here
			 * username: 
			 */
			host: 'localhost',
			port: 6379,
			prefix: 'mudjs:'
		}
	},
	email:
	{
		// you will definitely want to keep these out of 
		// source control. Highly recommended to keep
		// in environment variables in a local .env
		// file or a protected process manager.
		service: 'gmail',
		auth: {user: 'someusername', pass: 'somepass'}
	}
};