require('dotenv').config({ path: `./src/.env.${process.env.NODE_ENV}` });
const Redis = require("redis");
const redisClient = Redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.connect();

redisClient.on('error', (err) => {
    console.log("redis error: ", err);
});

module.exports = redisClient;
