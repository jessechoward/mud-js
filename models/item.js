const config = require('config');
const logger = require('../src/logging');
const uuid = require('../src/uuid');

module.exports = (sequelize, dataTypes) =>
{
	const Item = sequelize.define('item',
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
	return Item;
};