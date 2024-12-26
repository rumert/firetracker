const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    nickname: {
        type: String,
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
        type: [String],
        default: [],
    },
    budget_ids: {
        type: [String],
        default: [],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('User', userSchema);
