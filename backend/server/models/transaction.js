const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    budget_id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: String,
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
