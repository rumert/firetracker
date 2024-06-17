const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { randomUUID } = require('node:crypto');

const userSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID()
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('User', userSchema);
