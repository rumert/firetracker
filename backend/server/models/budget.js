const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { randomUUID } = require('node:crypto');

const budgetSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID(),
    },
    user_id: {
        type: Schema.Types.UUID,
        required: true,
    },
    base_balance: {
        type: Number,
        required: true,
    },
    transaction_ids: {
        type: [Schema.Types.UUID],
        default: [],
    },
    current_balance: {
        type: Number,
        default: function() {
            return this.base_balance
        }
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Budget', budgetSchema);
