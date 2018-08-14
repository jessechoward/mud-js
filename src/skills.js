const utils = require('./utils');
const Dice = require('./dice').Dice;
const logger = require('./logging');

const AbilityToSkillMap =
{
	strength: ['athletics'],
	dexterity: ['acrobatics', 'slight_of_hand', 'stealth'],
	intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
	wisdom: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
	charisma: ['deception', 'intimidation', 'performance', 'persuasion'],
	constitution: []
};

const SkillToAbilityMap = {};

const populateSkillToAbilityMap = () =>
{
	const abilities = Object.keys(AbilityToSkillMap);
	for (let ability = 0; ability < abilities.length; ability++)
	{
		AbilityToSkillMap[abilities[ability]].forEach((skill) =>
		{
			SkillToAbilityMap[skill] = abilities[ability];
		});
	}
};
populateSkillToAbilityMap();

exports.AbilityToSkillMap = Object.freeze(AbilityToSkillMap);
exports.SkillToAbilityMap = Object.freeze(SkillToAbilityMap);