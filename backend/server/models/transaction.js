const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { randomUUID } = require('node:crypto');

const transactionSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID(),
    },
    budget_id: {
        type: Schema.Types.UUID,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Transaction', transactionSchema);
