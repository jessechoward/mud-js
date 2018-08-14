const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid/v4');
const Ability = require('./abilities');
const Skill = require('./skill');
const logger = require('./logging');

class Character extends EventEmitter
{
	constructor(template, descriptor)
	{
		this.descriptor = descriptor;
		this.name = template.name;
		this.keywords = template.keywords;
		this.short_description = template.short_description;
		this.description = template.description;
		this.long_description = template.long_description;
		this.abilities = {};
		Object.keys(template.abilities).forEach((ability) =>
		{
			this.abilities[ability] = new Ability(template.abilities[ability]);
		});
		this.skills = {};
		Object.keys(template.skills).forEach((skill) =>
		{
			this.skills[skill] = new Skill(template.skills[skill]);
		});
	}
}