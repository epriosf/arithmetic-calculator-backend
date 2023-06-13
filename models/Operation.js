const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OperationSchema = Schema(
    {
        type: {
            type: String,
            required: true,
            unique: true,
        },
        cost: {
            type: String,
            required: true,
        },
    },
);

module.exports = mongoose.model('Operation', OperationSchema);
