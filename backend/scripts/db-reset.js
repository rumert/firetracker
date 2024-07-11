const mongoose = require('mongoose');
require('dotenv').config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL);


mongoose.connection.once('open', async () => {
    await mongoose.connection.db.dropDatabase();
    console.log('Database reset');
    process.exit(0);
});