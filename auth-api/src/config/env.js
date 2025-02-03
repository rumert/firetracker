const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
    path: path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV}`),
    ...(process.env.NODE_ENV === 'production' && { encoding: 'ucs2' }),
});

module.exports={
    NODE_ENV: process.env.NODE_ENV,
    ACCESS_TOKEN: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN_SECRET,
    MONGO_URL: process.env.MONGO_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_DB: process.env.REDIS_DB,
    AI_KEY: process.env.AI_KEY,
}