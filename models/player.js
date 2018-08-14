const config = require('config');
const logger = require('../src/logging');
const uuid = require('../src/uuid');

module.exports = (sequelize, dataTypes) =>
{
	const Player = sequelize.define('player',
	{
		id: {type: dataTypes.STRING, allowNull: false, primaryKey: true, defaultValue: uuid},
		name: {type: dataTypes.STRING, allowNull: false, unique: true},
		attributes: {type: dataTypes.JSON, allowNull: false},
		enabled: {type: dataTypes.BOOLEAN, allowNull: false, defaultValue: true}
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

	// todo - add more associations
	return Player;
};