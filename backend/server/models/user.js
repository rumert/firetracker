const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { randomUUID } = require('node:crypto');

const userSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID(),
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
    password_hash: {
        type: String,
        required: true,
    },
    refresh_token_ids: {
        type: [Schema.Types.UUID],
        default: [],
    },
    budget_ids: {
        type: [Schema.Types.UUID],
        default: [],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('User', userSchema);
