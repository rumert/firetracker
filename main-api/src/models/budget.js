const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const budgetSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    base_balance: {
        type: Number,
        required: true,
    },
    transaction_ids: {
        type: [String],
        default: [],
    },
    current_balance: {
        type: Number,
        default: function() {
            return this.base_balance
        }
    },
    categories: {
        type: [String],
        default: [],
    },
    is_default: {
        type: Boolean,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Budget', budgetSchema);
