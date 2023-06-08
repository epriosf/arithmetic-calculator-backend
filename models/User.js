const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            validate: [
                (val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)
            ]
        },
        password: {
            type: String,
            required: true,
            min: 4
        },
        status: {
            type: String,
            required: false
        },
        user_balance: {
            type: String,
            required: false
        },
        refresh_token: String
    },
);

module.exports = mongoose.model('User', UserSchema);
