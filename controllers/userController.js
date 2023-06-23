const userService = require('../services/userService');

const findUserByUsername = async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(422).json({ message: 'Invalid username field' });
    }
    try {
        const user = await userService.findUserByUsername(username);
        res.json({ user });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }

}

const findUserAndUpdateBalance = async (req, res) => {
    const { username, userBalanceUpdated } = req.body;
    if (!username || !userBalanceUpdated) {
        return res.status(422).json({ message: 'Invalid User fields' });
    }
    try {
        await userService.findUserAndUpdateBalance(username, userBalanceUpdated);
        res.status(200).json({ message: 'User balance was updated' });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

module.exports = { findUserByUsername, findUserAndUpdateBalance };
