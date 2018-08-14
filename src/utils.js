const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

exports.uuid = () =>
{
	return uuidv4().replace('-', '');
};

exports.md5 = (data) =>
{
	crypto.createHash('md5').update(data).digest('hex').replace('-', '');
};