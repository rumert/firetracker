const Redis = require("redis");
const redisClient = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 14639
    }
});

redisClient.connect();

redisClient.on('error', (err) => {
    //console.log("redis error: ", err);
});

module.exports = redisClient;
