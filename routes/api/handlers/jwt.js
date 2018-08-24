const config = require('config');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const ms = require('ms');
const codes = require('http-status-codes');
const cache = require('../../../cache/redis');
const uuid = require('../../../src/utils').uuid;
const logger = require('../../../src/logging');
const keys = {};
const revoked = new Set();

const jwtOptions = config.get('jsonwebtoken');

// this should be called when the application starts
const updateRevoked = () =>
{
	cache.client.zrangebyscore(jwtOptions.revoked_cache_key,
		Date.now() - jwtOptions.verify.maxAge, '+inf', (error, reply) =>
	{
		if (error)
		{
			// it is a pretty big security hole if we can't use our external cache for
			// the revoked jwt list
			logger.critical('Redis error getting revoked key list', {error: error});
			logger.critical('Shutting down', {error: 'required redis connection not available'});
			process.exit(-1);
			return;
		}
		// a new empty set in case the old one was stale
		revoked = new Set();
		// load the list into the set
		if (reply) reply.forEach((jwtId) => {revoked.add(jwtId);});
	});
};
exports.updateRevoked = updateRevoked;

// clean up the revoked list periodically
setInterval(() =>
{
	// remove revoked keys that will get denied by their max expire time
	cache.client.zremrangebyscore(jwtOptions.revoked_cache_key,
		'-inf', Date.now() - jwtOptions.verify.maxAge, (error, reply) =>
	{
		if (error)
		{
			logger.error('Redis error', {error: error});
			return;
		}
		if (parseInt(reply) > 0) logger.debug('Cleaning up expired ')
	});
}, jwtOptions.revoked_cache_cleanup || ms('15m'));

const invalidToken = (res) =>
{
	return res
		.status(codes.UNAUTHORIZED)
		.set('WWW-Authenticate', 'Bearer realm="mudjs connection"')
		.json({error: 'Missing or invalid token', message: 'Authentication required'});
};

// keys are absolute paths
if (config.has('keys.absolute_path') && config.get('keys.absolute_path'))
{
	keys.private = fs.readFileSync(config.get('keys.private'), 'utf8');
	keys.public = fs.readFileSync(config.get('keys.public'), 'utf8');
}
// [default] keys are relative to the project directory
else
{
	const keyPath = path.join(__dirname, '../../keys');
	keys.private = fs.readFileSync(path.join(keyPath, config.get('keys.private')));
	keys.public = fs.readFileSync(path.join(keyPath, config.get('keys.public')));
}
logger.debug('Keys loaded for JWT signing/validation');

// validate there is a semantically correct authorization header and bearer token
// req.providedToken used by this.verify
const bearer = (req, res, next) =>
{
	const authHeader = req.header('authorization');
	if (!authHeader) return invalidToken(res);
	const parts = authHeader.trim().match(/^(Bearer) (.{32,})$/i);
	if (!parts) return invalidToken(res);
	req.signedToken = parts[2];
	return next();
};
exports.bearer = bearer;

// this is meant as a request terminator and has no next() method
// create and sign a jwt with the account as the payload
// req.account is added from successful login
const sign = (req, res) =>
{
	const signOptions = Object.assign({}, jwtOptions.sign, {jwtid: uuid()});

	req.jwtSigned = jwt.sign(req.account, keys.private, signOptions, (error, token) =>
	{
		if (error)
		{
			logger.error('Error signing jwt', {error: error});
			return res.status(codes.INTERNAL_SERVER_ERROR).json({error: 'unable to sign token request'});
		}
		// return the endpoint
		return res.status(codes.CREATED).json({token: token});
	});
};
exports.sign = sign;

// verify jwt is valid, not expired or revoked
// req.providedToken provided by this.bearer
// adds req.token as the validated decoded token
const verify = (req, res, next) =>
{
	jw.verify(req.providedToken, keys.public, jwtOptions.verify, (error, decoded) =>
	{
		const status = {error: error, isRevoked: decoded ? isRevoked(decoded.jti) : 'unknown'};

		if (error || isRevoked(decoded.jti));
		{
			logger.warning('Invalid token used', status);
			return invalidToken(res);
		}
		// pass the decoded token along the chain
		req.token = decoded;
		return next();
	});
};
exports.verify = verify;

// revoke a jwt by id
// todo: still need to hook this into live sessions
const revoke = (jwtId, reason={}) =>
{
	// revoked is a module scoped private variable used to keep track
	// of revoked jwtIds
	revoked.add(jwtId);
	// this places the revoked keys to be loaded on restart
	return new Promise((resolve, reject) =>
	{
		cache.client.zadd(jwtOptions.revoked_key_cache, Date.now(), jwtId, (error, reply) =>
		{
			if (error)
			{
				logger.error('Redis error', {error: error});
				return reject(error);
			}
			let level = reason.level || 'info';
			logger[level]('revoking jwt', {jwt: jwtid, reason: reason.message});
			return resolve();
		});
	});
};
// we need this non-middleware method
// for other modules
exports.revoke = revoke;
// middleware to allow a jwt to loguout/cancel
// expects to be an endpoint and always returns a 200 ok
// also expects verify to be called first
exports.cancel = (req, res) =>
{
	// this always returns okay and the use of a set kind of
	// makes this idempotent in that subsequent calls while
	// may return a different message, don't actually alter
	// any state
	if (req.token) revoke(req.token.jti, 'normal logout');
	return res.status(codes.OK).json({token: 'undefined'});
};

// check if a jwtId has been revoked
// this isn't necessarily an error
// as jwtIds can be revoked just for
// logging out before they expire
const isRevoked = (jwtId) =>
{
	return revoked.has(jwtId);
};
exports.isRevoked = isRevoked;

