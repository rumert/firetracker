const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const budgetSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
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
        type: [Schema.Types.ObjectId],
        default: [],
    },
    current_balance: {
        type: Number,
        default: function() {
            return this.base_balance
        }
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
