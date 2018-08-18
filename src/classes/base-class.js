const config = require('config');
const Dice = require('../dice');

// this setting will be required or the game own't start
const MAX_CLASS_LEVEL = config.get('settings.max_class_level');

class BaseClass
{
	/**
	 * Creates an instance of BaseClass.
	 * Nearly all values should be overriden for player classes.
	 * @memberof BaseClass
	 */
	constructor(options)
	{
		// the class level
		this._level = 1;
		// base hitpoints we start with at level 1 (not applying ability/constitution modifier)
		this._base_hp = options.base_hp;
		// keep track of hitpoint rolls - initialize them all to 0
		this._hitpoint_rolls = new Array(MAX_CLASS_LEVEL).fill(0);
		// apply the base hitpoints as a roll
		this._hitpoint_rolls[0] = this._base_hp;
		// change the type of dice and ability modifier
		// per class - example {type: 'd6', ability: 'strength'}
		this._hit_dice = options.hit_dice;
		// proficiencies
		this._
	}

	/**
	 * Is this class usable by players?
	 * Defaults to false and
	 * overloaded only by playable classes
	 *
	 * @readonly
	 * @return {Boolean} true if playable, otherwise false
	 * @memberof BaseClass
	 */
	get playable() {return false;}

	/**
	 * Roll hit dice based on the class.
	 * 
	 * @param {Object} abilities - the class will choose the correct modifier to apply from the player's abilities
	 * @param {int} [bonus=0] - an optional bonus
	 * @returns {int}
	 * @memberof BaseClass
	 */
	hitDice(bonus=0)
	{
		return Dice.roll(this._level, this._hit_dice.type, abilities[this._hit_dice.ability].modifier + bonus);
	}

	maxHitPoints(constModifier)
	{
		let total = 0;
		for (let level = 0; level <= this._level-1; level++)
		{
			total += this._hitpoint_rolls[level] + modifier;
		}

		return total;
	}

	/**
	 * Add a level to this class
	 *
	 * @param {int} level - a number between 2 and MAX_CLASS_LEVEL inclusive
	 * @memberof BaseClass
	 */
	onLevelUp(level)
	{

	}

	
}