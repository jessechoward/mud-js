const router = require('express').Router();

router.use('/', (req, res) =>
{
	res.send('websocket');
});

module.exports = router;
