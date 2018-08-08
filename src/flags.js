const logger = require('./logging');

const containsAll = (table, values) =>
{
	for (let i = 0; i < values.length; i++)
	{
		if (!table.contains(values[i])) return false;
	}

	return true;
}

const assertCombinable = (flagTable) =>
{
	if (!flagTable.combinable)
	{
		logger.error('Attempt to perform flag operation using non-combinable flag',
			{error: {table_name: flagTable.name}});
		return false;
	}

	return true;
}

exports.FlagValue = class FlagValue
{
	constructor(flagTable, initialValue)
	{
		this._flagTable = flagTable;
		// if we are combinable then we are a set
		if (flagTable.combinable)
		{
			this._value = new Set();
		}
		// otherwise we are a simple string
		else
		{
			this._value = undefined;
		}

		// use the internal setter
		this.value = initialValue;
	}

	/**
	 * Set the value of the flag as if it was an attribute.
	 * This hides our implementation of the underlying _value
	 * @param {string|string[]} newValue 
	 */
	set value(newValue)
	{
		// make sure we check the value(s) for safety
		// Note: This results in no values being set
		// if one of the values given does not belong to
		// the flag table.
		if (!this._flagTable.contains(newValue)) return;

		// handle the case where our flag table is basically an enum
		if (!this._flagTable.combinable)
		{
			this._value = newValue;
			return;			
		}

		// reset all values
		this._value.clear();

		// handle a newValue type of array
		if (newValue instanceof Array)
		{
			newValue.forEach((value) =>
			{
				this._value.add(value.toLowerCase());
			});
		}
		else
		{
			this._value.add(newValue.toLowerCase());
		}
	}

	get value()
	{
		if (this._flagTable.combinable)
		{
			return Array.from(this._value);
		}

		return this._value;
	}

	/**
	 * Add a flag to the set (must be a combinable table)
	 * @param {string|string[]} value - the flag(s) to be turned on
	 */
	set(value)
	{
		// required!
		if (!assertCombinable(this._flagTable)) return;

		// always check first
		if (!this._flagTable.contains(value)) return;

		if (value instanceof Array)
		{
			for (let i = 0; i < value.length; i++)
			{
				this._value.add(value[i].toLowerCase());
			}
		}
		else
		{
			this._value.add(value.toLowerCase());
		}
	}

	/**
	 * Toggle a flag - if it is not set, set it, if it is already set, unset it.
	 * @param {string|string[]} value - the flag(s) to be toggled
	 */
	toggle(value)
	{
		// required!
		if (!assertCombinable(this._flagTable)) return;

		if (value instanceof Array)
		{
			for (let i = 0; i < value.length; i++)
			{
				// recursion
				// is it safe? probably.
				// is it efficient? probably not but it looks cleaner
				// and is easier to read
				this.toggle(value[i]);
			}
		}
		else
		{
			// since we do recursion, this was moved inside the else
			if (!this._flagTable.contains(value)) return;

			const val = value.toLowerCase();
			
			if (this._value.has(val))
			{
				this._value.delete(val);
			}
			else
			{
				this._value.add(val);
			}
		}
	}

	isSet(value, logicalAnd=true)
	{
		// required!
		if (!assertCombinable(this._flagTable)) return;

		// check if we are setting the right kind of values
		if (!this._flagTable.contains(value)) return false;

		// check if we can combine values
		if (this._flagTable.combinable)
		{
			// check if the value is an arrya
			if (value instanceof Array)
			{
				// iterate through the values to see if the set contains each
				for (let i = 0; i < value.length; i++)
				{
					if (this._value.has(value[i].toLowerCase()))
					{
						// we are using logical OR which means any true value is true
						if (!this.logicalAnd) return true;
					}
					else
					{
						// we are using logical AND which means any false value is false
						if (this.logicalAnd) return false;
					}
				}
			}

			// we must explicitly return true for logical AND
			return true;
		}

		// check if the value is equal
		return value.toLowerCase() === this._value;
	}

	/**
	 * Logical AND operator or intersection of values
	 * @param {Array} values - an array of values to intersect with
	 * @return {FlagValue} a new FlagValue Object of the intersecting values
	 */
	and(values)
	{
		if (!assertCombinable(this._flagTable)) return null;

		// make sure we are checking values
		if (!this._flagTable.contains(values)) return null;

		const intersection = values.filter((val) => {return this._flags.has(val);});
		return new FlagValue(this._flagTable, intersection);
	}

	/**
	 * Logical OR operator or union of values
	 * @param {Array} values - an array of values to intersect with
	 * @return {FlagValue} a new FlagValue Object of the combined values
	 */
	or(values)
	{
		if (!assertCombinable(this._flagTable)) return null;

		// make sure we are checking values
		if (!this._flagTable.contains(values)) return null;

		const union = values.concat(Array.from(this._value));
		return new FlagValue(this._flagTable, union);
	}
};

exports.FlagTable = class FlagTable
{
	constructor(options)
	{
		this._name = options.name;
		this._flags = new Set();
		options.flags.forEach((name) =>
		{
			// make sure everything is lowercase and reduce/replace spaces and dashes with underscores
			this._flags.add(name.toLowerCase().replace(/[ -]+/g, '_'));		
		});
		this._flags = Object.freeze(this._flags);
		this._combinable = options.combinable;
	}

	// override for logging
	toString()
	{
		return `FlagTable: {name: ${this._name}, flags: ${this._flags}, combinable: ${this._combinable}}`;
	}

	// override for logging
	inspect(depth, opts)
	{
		return this.toString();
	}

	get name()
	{
		return this._name;
	}

	get combinable()
	{
		return this._combinable;
	}

	// really only used so we can generically call (object.value) for serializing
	get value()
	{
		
	}

	/**
	 * Check if a table contains the value being requested.
	 * Also checks if the value is an array, if the table supports
	 * flag vs enum functionality.
	 * @param {string|string[]} value 
	 */
	contains(value)
	{
		let rvalue = true;
	
		// handle an array of values to check
		if (value instanceof Array)
		{
			// make sure the table allows combined flags
			if (!assertCombinable(this)) return false;

			// check that each flag belongs to this table
			for (let i = 0; i < value.length; i++)
			{
				if (!this._flags.has(value[i].toLowerCase())) rvalue = false;
			}
		}
		else
		{
			if (!this._flags.has(value.toLowerCase())) rvalue = false;
		}

		if (!rvalue)
		{
			logger.error('Comparing unrecognized value with table',
				{error: {table_name: this._flagTable.name, value: value}});
		}

		return rvalue;
	}
}