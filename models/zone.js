const config = require('config');
const logger = require('../src/logging');
const uuid = require('../src/uuid');

module.exports = (sequelize, dataTypes) =>
{
	const Zone = sequelize.define('zone',
	{
		id: {type: dataTypes.STRING, allowNull: false, primaryKey: true, defaultValue: uuid},
		name: {type: dataTypes.STRING, allowNull: false, unique: true},
		attributes: {type: dataTypes.JSON, allowNull: false},
		enabled: {type: dataTypes.BOOLEAN, allowNull: false, defaultValue: false}
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
	Zone.associate = (models) =>
	{
		Zone.hasMany(models.Rooms, {as: 'Rooms'});
		Zone.hasMany(models.Items, {as: 'Items'});
		Zone.hasMany(models.Npcs, {as: 'Npcs'});
	};

	return Zone;
};