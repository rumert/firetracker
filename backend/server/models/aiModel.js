const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { randomUUID } = require('node:crypto');

const aiModelSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID(),
    },
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
