const Redis = require("redis");
const redisClient = Redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

redisClient.connect();

redisClient.on('error', (err) => {
    console.log("redis error: ", err);
});

module.exports = redisClient;
