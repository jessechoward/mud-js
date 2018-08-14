const EventEmitter = require('events').EventEmitter;
const utils = require('./utils');
const Dice = require('./dice').Dice;
const logger = require('./logging');

const effect_reduce = (effects) =>
{
	return Objects.keys(effects).reduce((compound, key) =>
	{
		return compound + effects[key].modifier;
	});
};

class Ability
{
	constructor(options)
	{
		this._options = Object.assign({}, {maxScore: 30, bonus: 0, perms: []}, options);
		this._baseScore = options.baseScore;
		// temp effects will have to be applied externally
		this._temp = {};
		// resetPerms calls _updateScore
		this.resetPerms();
	}

	_updateScore()
	{
		this._score = this.baseScore;
		this._score += effect_reduce(this._perms);
		this._score += effect_reduce(this._temp);
		this._score = Math.min(this._score, this._options.maxScore);
	}

	get score()
	{
		return this._score;
	}

	get baseScore()
	{
		return this._baseScore;
	}

	get modifier()
	{
		return Math.floor((this.score - 10) / 2);
	}

	applyPerm(modifier, type)
	{
		const perm = {modifier: modifier, type: type};
		// the id is the md5 of the perm
		// this means we can't apply the same mod multiple times
		// unless the modifier or type is different
		this._perms[utils.md5(perm)] = perm;
		this._updateScore();
	}

	removePerm(id)
	{
		delete this._perms[id];
		this._updateScore();
	}

	resetPerms()
	{
		this._perms = {};
		for (let perm = 0; perm < perms.length; perm++) this.applyPerm(this._options.perms[perm]);
		this._updateScore();
	}

	applyTemp(id, modifier, type)
	{
		this._temp[id] = id;
		this._updateScore();
	}

	removeTemp(id)
	{
		delete this._temp[id];
		this._updateScore();
	}

	check(bonus=0)
	{
		// https://roll20.net/compendium/dnd5e/Ability%20Scores#toc_4
		return Dice.d20(this.modifier+bonus);
	}

	serialize()
	{
		const perms = [];
		const keys = Object.keys(this._perms);
		for (let key = 0; key < keys; key++)
		{
			perms.push(this._perms[keys[key]]);
		}

		return Object.assign({},
		{
			baseScore: this._base,
			maxScore: this._maxScore,
			bonus: this._bonus,
			perms: perms 
		});
	}
}
module.exports = Ability;