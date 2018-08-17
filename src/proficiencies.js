class Proficiency
{
	constructor(proficiencies=[])
	{
		this._groups =
		{
			armor: new Set(),
			weapons: new Set(),
			tools: new Set(),
			skills: new Set(),
			saving_throws: new Set()
		};

		for (let item = 0; item < proficiencies.length; item++)
		{
			this.addProficiency(proficiencies[item].group, proficiencies[item].name);
		}

	}

	addProficiency(group, name)
	{
		// normalize the group name in case people get fancy
		group = group.toLowerCase().replace(' ', '_');
		if ()
		this._groups
	}
};