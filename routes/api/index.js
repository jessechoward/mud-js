const router = require('express').Router();

router.post('/login', (req, res, next))
router.use('/', (req, res) =>
{
	res.send('api');
});

module.exports = router;
