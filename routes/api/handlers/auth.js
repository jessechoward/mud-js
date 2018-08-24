const express = require('express');
const login = require('./login');
const jwt = require('./jwt');
const registration = require('./registration');

// use this for routes where authentication (JWT) is required
exports.required = express.Router().use(jwt.bearer, jwt.verify);
// use this for handling login requests to generate a JWT
exports.login = express.Router().use(login.login, jwt.sign);
// use this to logout - this invalidates the users JWT
exports.logout = jwt.cancel;
// use this to register - also
exports.register = express.Router().use(registration.register, jwt.sign);