const { REDIS_HOST, REDIS_PORT, REDIS_DB } = require("./env");
const Redis = require("redis");
const redisClient = Redis.createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    database: REDIS_DB
});

redisClient.connect();

redisClient.on('error', (err) => {
    console.log("redis error: ", err);
});

module.exports = redisClient;
