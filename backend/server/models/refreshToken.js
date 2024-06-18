const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('node:crypto');

const refreshTokenSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID(),
    },
    user_id: {
        type: Schema.Types.UUID,
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expires_at: {
        type: Date,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
