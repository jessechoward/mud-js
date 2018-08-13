class Players
{
	constructor(redisClient)
	{
		this.redis = redisClient;
		this.playersHashKey = 'players';
	}

}