const config = require('config');
const nodemailer = require ('nodemailer');

const mta = nodemailer.createTransport(config.get('email'));
exports.mta = mta;

const send = (mailOptions) =>
{
	mailOptions = Object.assign({},
	{
		from: 'noreply@mudjs.example.com',
		to: 'unresolved@mudjs.example.com',
		subject: 'something cool',
		html: '<p>Email Body</p>'
	}, mailOptions);

	return new Promise((resolve, reject) =>
	{
		// make sure we have an mta
		if (!mta) return reject('No MTA found.');
		// parts of the email we will log
		const logParts =
		{
			from: mailOptions.from,
			to: mailOptions.to,
			subject: mailOptions.subject
		};

		// try to send an email
		mta.sendMail(mailOptions, (error, info) =>
		{
			// check for mta errors
			if (error)
			{
				logger.error('nodemail error',
				{
					error: error,
					mail: logParts
				});
				return reject(error);
			}

			logger.debug('Sending mail', {mail: logParts});
			return resolve(info);
		});
	});
};
exports.send = send;
