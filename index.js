const bcrypt = require('bcrypt');

for (let i=0; i < 10; i++)
{
	bcrypt.hash('jesse', (i+1)*2, (error, result) =>
	{
		console.log(result);
	});
}
