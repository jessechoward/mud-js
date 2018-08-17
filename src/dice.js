const logger = require('./logging');

/**
 * Provide a random positive integer between min and max inclusive.
 * 
 * @param {int} min the smallest number allowed
 * @param {int} max the greatest number allowed
 * @returns {int}
 */
const randRange = (min, max) =>
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randRange = randRange;

/**
 * An object to help validate shorthand dice strings to integer values
 */
const DiceType = Object.freeze(
{
	d4: 4,
	d6: 6,
	d8: 8,
	d10: 10,
	d12: 12,
	d20: 20
});
exports.DiceType = DiceType;

/**
 * Represents a grouping of similar type dice for rolling.
 *
 * @class Dice
 */
class Dice
{
	/**
	 * Roll our dice and apply an optional bonus modifier
	 *
	 * @returns {int} the sum
	 * @memberof Dice
	 */
	static roll(count, type='d6', bonus=0)
	{
		const sides = DiceType[type];

		if (!sides)
		{
			logger.error('Attempt to use invalid dice type', {dice_type: type});
			return 0;
		}

		if (this._count >= 100)
			logger.warning('High number of dice being assigned', {dice_count: count});

		// add the bonus as the base
		let rval = bonus;

		for (let die = 0; die < this.count; die++)
		{
			rval += randRange(1, sides);
		}

		return rval;
	}

	/**
	 * Roll for a percentage using a "tens" die and a "ones" die.
	 * Rolling a double 00 and a 0 (sum == 0) results in a 100
	 *
	 * @static
	 * @returns {int} a whole number between 1 and 100 inclusive
	 * @memberof Dice
	 */
	static percentage()
	{
		const tens = randRange(0, 9) * 10;
		const ones = randRange(0, 9);
		const percent = tens+ones;

		// holy critical batman!
		if (percent === 0) return 100;

		return percent;
	}

	/**
	 * Roll a single d20 with an optional modifier.
	 * Commonly used for saving throws, abillity checks, initiative, etc.
	 *
	 * @static
	 * @param {int} [bonus=0] optional modifier (may be negative)
	 * @returns {int} sum of the d20 roll and the modifier (may be negative)
	 * @memberof Dice
	 */
	static d20(bonus=0)
	{
		return Dice.roll(1, 'd20', bonus);
	}

	/**
	 * Roll 2 d20 dice and take the greater value with an optional modifier.
	 * 
	 * @static
	 * @param {int} [bonus=0] optional modifier (may be negative)
	 * @returns {int} the greater of 2 d20 rolls plus an optional modifier.
	 * @memberof Dice
	 */
	static advantage(bonus=0)
	{
		return Math.max(Dice.d20(), Dice.d20()) + bonus;
	}

	/**
	 * Roll 2 d20 dice and take the lesser value with an optional modifier.
	 * 
	 * @static
	 * @param {int} [bonus=0] optional modifier (may be negative)
	 * @returns {int} the lesser of 2 d20 rolls plus an optional modifier.
	 * @memberof Dice
	 */
	static disadvantage(bonus=0)
	{
		return Math.min(Dice.d20(), Dice.d20()) + bonus;
	}

	/**
	 * Roll 3d6 dice to determine an attribute score. Optionally add a modifier.
	 *
	 * @static
	 * @param {int} [maxScore=30] the maximum score allowed for this attribute including the modifier
	 * @param {int} [bonus=0] an optional modifier to be applied to the roll (may be negative)
	 * @returns {int} the maxScore capped attribute value
	 * @memberof Dice
	 */
	static attributeRoll(maxScore=30, bonus=0)
	{
		// hard code the max score to 30
		maxScore = Math.min(maxScore, 30);
		// we treat the bonus as a base
		let total = bonus;
		let worst = 0;

		// roll 4 dice
		for (let roll = 0; roll < 4; roll++)
		{
			const rollValue = Dice.roll(1, 'd6');
			total += rollValue;
			if (rollValue < worst) worst = rollValue;
		}
		// drop the worst roll
		total -= worst;

		// constrain the result inside the maxScore
		return Math.min(total, maxScore);
	}
};
exports.Dice = Dice;