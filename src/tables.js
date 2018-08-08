import FlagTable from './flags';

exports.DescriptorState = new flags.FlagTable(
{
	name: 'DescriptorState',
	flags: ['connecting', 'connected', 'closing', 'closed'],
	combinable: false
});

exports.PlayerState = new flags.FlagTable(
{
	name: 'PlayerState',
	flags: ['create', 'authenticate', 'playing', 'idle', 'linkdead'],
	combinable: false
});

exports.ConditionFlags = new flags.FlagTable(
{
	name: 'ConditionFlags',
	flags: ['blinded', 'charmed', 'deafened', 'fatigued', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious', 'exhastion'],
	combinable: false
});