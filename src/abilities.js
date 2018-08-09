const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid/v4');
const Dice = require('./dice').Dice;
const logger = require('./logging');

const AbilityTypes =
{
	strength: 0,
	intelligence: 1,
	dexterity: 2,
	wisdom: 3,
	constitution: 4,
	charisma: 5
};
exports.AbilityTypes;

class AbilityEffect extends EventEmitter
{
	constructor(name, ability, duration, modifier)
	{
		this.id = uuid();
		this.name = name;
		this.ability = ability;
		this.duration = duration;
		this.end = Date.UTC() + duration;
		this.modifier = modifier;

		// set a timer to expire the modifier
		this._timeout = setTimeout(() => {this.emit('expire', this.id)},  duration*1000);
	}

	cancel()
	{
		clearTimeout(this._timeout);
	}
}
exports.AbilityEffect;

class Ability
{
	constructor(maxScore, bonus)
	{
		this._base = Dice.attributeRoll(maxScore, bonus);
		this._mods = {};
		this._score = this._base;
	}

	_updateScore()
	{
		this._score = this._base;

		for (let id in this._mods)
		{
			this._score += this._mods[id].value;
		}
	}

	get score()
	{
		return this._score;
	}

	get modifier()
	{
		return Math.floor((this.score - 10) / 2);
	}

	applyEffect(effect)
	{
		// add the new effect
		this._mods[effect.id] = effect;

		// make sure we capture the expiration event
		effect.on('expire', (id) =>
		{
			delete this._mods[id];
			this._updateScore();
		});

		this._updateScore();

		return effect.id;
	}
}
exports.Ability = Ability;