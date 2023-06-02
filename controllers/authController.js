const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function register(req, res) {
    const { username, password, password_confirm, status } = req.body;

    if (!username || !password || !status) {
        return res.status(422).json({message: 'Invalid User fields' });
    }
    if (password !== password_confirm) {
        return res.status(422).json({ message: 'Passwords do not match' });
    }
    const userExists = await User.exists({ username }).exec();
    if (userExists) {
        return res.status(409).json({message:'Username Already Exists'});
    }
    try {
        hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ username, password: hashedPassword, status });
        return res.sendStatus(201);
    } catch (error) {
        return res.status(400).json({ message: 'Threre was a problem. User was not register' })
    }

}
async function login(req, res) {
    const { username, password, status } = req.body;

    if (!username || !password || !status) {
        return res.status(422).json({ 'message': 'Invalid User fields' });
    }
    const user = await User.findOne({ username });

    if (!user) {
        return res.sendStatus(401);
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(401).json({ message: "Username or password is not correct" });
    }

    const accessToken = jwt.sign(
        {
            username: user.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '900s'
        }
    );
    const refreshToken = jwt.sign(
        {
            username: user.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '1d'
        }
    );

    user.refresh_token = refreshToken;
    await user.save();

    res.cookie('refresh_token', refreshToken, { httpOnly: true, maxTime: 24 * 60 * 60 * 1000 });
    res.json({ access_token: accessToken });

}
async function logout(req, res) {
    res.sendStatus(200);
}

module.exports = { register, login, logout };