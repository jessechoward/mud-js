const express = require('express');
const login = require('./login');
const jwt = require('./jwt');

// use this for routes where authentication (JWT) is required
exports.required = express.Router().use(jwt.bearer, jwt.verify);
// use this for handling login requests to generate a JWT
exports.login = express.Router().use(login.login, jwt.sign);
// use this to logout
exports.logout = jwt.cancel;