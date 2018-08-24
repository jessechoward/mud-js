const router = require('express').Router();
const auth = require('./handlers/auth');
const otuToken = require('./handlers/one-time-token');

// login and get a JWT for API use/connecting to the game server
router.post('/auth', auth.login);
// register a new account and get a JWT for API use/connecting to the game server
router.post('/account', auth.register);

/*****************************************************
 * beyond here all routes require JWT verification
 */
router.use(auth.required);
/*****************************************************/

// logout
router.delete('/auth', auth.logout);

// account (C)RUD - creation is done via the users
router.put('/account/:accountid')

module.exports = router;
