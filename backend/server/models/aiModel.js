const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const aiModelSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('AiModel', aiModelSchema);
