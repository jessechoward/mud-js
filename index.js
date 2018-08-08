const dice = require('./src/dice');

const counts = {};

for (let roll = 0; roll < 1000000; roll++)
{
	const value = dice.percentage();

	counts[value] = ++counts[value] || 1;
}

for (let key in counts)
{
	const val = counts[key];
	const dev = ((val/100) - 100).toFixed(2);

	counts[key] = {count: val, dev: `${dev > 0.00 ? '+' : ''}${dev}`};
}

console.log(counts);
