const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
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
