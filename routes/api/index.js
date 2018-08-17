const router = require('express').Router();

router.use('/', (req, res) =>
{
	res.send('api');
});

module.exports = router;
