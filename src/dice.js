exports.intRange = (min, max) =>
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.percentage = () =>
{
	const tens = this.roll('1d10-1');
	const ones = this.roll('1d10-1');

	// a 00 is 100
	if (tens === ones && tens === 0) return 100;

	return (tens*10)+ones;
};

exports.DiceType = Object.freeze(
{
	d4: 4,
	d6: 6,
	d8: 8,
	d10: 10,
	d12: 12,
	d20: 20
});

exports.rollPattern = /^(\d+)(d(4|6|8|10|12|20))([+-])(\d+)?$/i;

exports.parse = (dString) =>
{
	const parts = dString.match(this.rollPattern);
	if (parts)
	{
		let modifier = 0;
		if (parts.length > 4)
		{
			modifier = parseInt(parts[5]);
			if (parts[4] === '-') modifier *= -1;
		}

		return {count: parseInt(parts[1]), type: parts[2], sides: parseInt(parts[3]), modifier: modifier};
	}

	return null;
};

exports.roll = (dString) =>
{
	const dice = this.parse(dString);

	if (dice)
	{
		let rval=dice.modifier;
		for (let d=0; d<dice.count; d++)
		{
			rval += this.intRange(1, dice.sides);
		}

		return rval;
	}

	return NaN;
}