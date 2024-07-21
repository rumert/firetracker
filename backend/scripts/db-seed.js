const mongoose = require('mongoose');
const Budget = require('../src/models/budget');
const User = require('../src/models/user');
require('dotenv').config();
const bcrypt = require("bcrypt")

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL);

mongoose.connection.once('open', async () => {

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash('Test21', salt)

    const user = await User.create({
        username: 'test',
        email: 'test@gmail.com',
        password_hash: hash
    })

    await Budget.create({
        user_id: user.id,
        name: 'test',
        base_balance: 100,
        is_default: true
    })

    console.log('User and budget created successfully');
    process.exit(0);
});