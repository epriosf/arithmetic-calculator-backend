const User = require('../models/User');

const findUserByUsername = async (username) => {
    const user = await User.findOne({ username }).select('-password -refresh_token -status -__v');;
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

const findUserAndUpdateBalance = async (username, userBalanceUpdated) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { user_balance: userBalanceUpdated } },
            { new: true }
        ).select('-password -refresh_token -status -__v');
        if (!user) {
            throw new Error('User not found');
        }
    } catch (error) {
        throw new Error('Failed to update user balance');
    }
}

module.exports = { findUserByUsername, findUserAndUpdateBalance };
