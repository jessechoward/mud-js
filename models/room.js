const config = require('config');
const logger = require('../src/logging');
const uuid = require('../src/uuid');

module.exports = (sequelize, dataTypes) =>
{
	const Room = sequelize.define('room',
	{
		id: {type: dataTypes.STRING, allowNull: false, primaryKey: true, defaultValue: uuid},
		attributes: {type: dataTypes.JSON, allowNull: false}
	},
	// options
	{
		timestamps: true,
		paranoid: true
	});

	// todo - add more associations
	return Room;
};