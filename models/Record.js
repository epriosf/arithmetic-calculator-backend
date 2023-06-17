const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RecordSchema = Schema(
    {
        operation_id: {
            type:  Schema.Types.ObjectId,
            required: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        amount: {
            type: Number,
            required: true
        },
        user_balance: {
            type: Number,
            required: true
        },
        operation_response: {
            type: String,
            required: true
        },
        is_deleted: { type: Boolean, default: false },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Record', RecordSchema);
