const config = require('config');
const bcrypt = require('bcrypt');
const logger = require('../src/logging');
const uuid = require('../src/uuid');

const encryptPassword = (instance, options) =>
{
	if (!instance.password)
	{
		throw new Error('Password is a required field!');
	}

	return new Promise((resolve, reject) =>
	{
		bcrypt.hash(instance.password, 10)
			.then((hash) =>
			{
				instance.password = hash;
				return resolve(hash);
			})
			.catch((error) =>
			{
				logger.error('Bcrypt error hashing password', {module: __filename, email: instance.email, error: error});
				return reject(error);
			});
	});
};

module.exports = (sequelize, datatypes) =>
{
	const Account = sequelize.define('account',
	{
		id: {type: datatypes.STRING, allowNull: false, primaryKey: true, defaultValue: uuid},
		email: {type: datatypes.STRING, allowNull: false, unique: true},
		password: {type: datatypes.STRING, allowNull: false},
		validated: {type: dataTypes.BOOLEAN, defaultValue: false},
		enabled: {type: dataTypes.BOOLEAN, defaultValue: true}
	},
	// options
	{
		timestamps: true,
		paranoid: true,
		indexes:
		[
			{fields: ['enabled']}
		]
	});

	// make sure we encrypt passwords on bulk create
	Account.addHook('beforeBulkCreate', 'hashPasswordOnBulkCreate', (instances, options) =>
	{
		instances.forEach((instance) =>
		{
			return encryptPassword(instance, options);
		});
	});

	// make sure we encrypt passwords on normal create
	Account.addHook('beforeCreate', 'hashPasswordOnCreate', (instance, options) =>
	{
		return encryptPassword(instance, options);
	});

	// add an instance method to updating a password
	// we should not allow password updates as a bulk operation
	Account.prototype.updatePassword = function (plainText)
	{
		this.password = plainText;
		return encryptPassword(this, {});
	};

	// password validation
	Account.prototype.validatePassword = function (plainText)
	{
		const instance = this;
		return new Promise((resolve, reject) =>
		{
			bcrypt.compare(plainText, instance.password, (error, match) =>
			{
				if (error) return reject(error);

				return resolve(match);
			});
		});
	};

	// Authenticate
	// this is a static method since we are looking for an instance
	Account.authenticate = function (email, plainText)
	{
		return new Promise((resolve, reject) =>
		{
			Account.findOne({where: {email: email, enabled: true}})
			.then((account) =>
			{
				if (account)
				{
					bcrypt.compare(plainText, account.password, (error, match) =>
					{
						if (error) return reject({error: error});
						// never return PII!
						// which includes email!
						// https://en.wikipedia.org/wiki/Personally_identifiable_information
						return resolve({id: account.id, authenticated: match});
					});
				}

				return reject({error: 'not found'});
			})
			.catch((error) =>
			{
				logger.error('Database error', {error: error});
				return reject({error: error});
			});			
		});
	};

	// Associations...
	Account.associate = function (models)
	{
		Account.hasMany(models.Players, {as: 'Players'});	
	};

	return Account;
};
