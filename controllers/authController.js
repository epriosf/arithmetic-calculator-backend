const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function register(req, res) {
    const { username, password, password_confirm, status } = req.body;

    if (!username || !password || !status) {
        return res.status(422).json({message: 'Invalid user fields' });
    }
    if (password !== password_confirm) {
        return res.status(422).json({ message: 'Passwords do not match' });
    }
    const userExists = await User.exists({ username });
    
    if (userExists) {
        return res.status(409).json({message:'Username already exists'});
    }
    try {
        const hashedpassword = await bcrypt.hash(password, 10);

        await User.create({ username, password: hashedpassword, status });
        res.sendStatus(201);
    } catch (error) {
        return res.status(400).json({ message: 'User was not register' });
    }

}
async function login(req, res) {
    const { username, password} = req.body;

    if (!username || !password) {
        return res.status(422).json({ message: 'Invalid user fields' });
    }

    const user = await User.findOne({ username });

    if (!user) {
        return res.sendStatus(401);
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(401).json({ message: "Username or Password not correct" });
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

    res.cookie('refresh_token', refreshToken, { httponly: true, maxage: 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
    res.json({ access_token: accessToken });

}
async function logout(req, res) {
    const cookies = req.cookies
    if(!cookies.refresh_token){
        return res.sendStatus(204);
    }
    const refreshToken = cookies.refresh_token;
    const user = await User.findOne({refresh_token: refreshToken}).exec();
    
    if(!user){
        res.clearCookie('refresh_token', {httponly: true, sameSite: 'None', secure: true});
        return res.sendStatus(204);
    }
    user.refresh_token = null;
    await user.save();
    res.clearCookie('refresh_token', { httponly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

async function refresh (req, res){
    const cookies = req.cookies;
    if(!cookies.refresh_token){
        return res.sendStatus(401);
    }
    const refreshToken = cookies.refresh_token;

    const user = await User.findOne({refresh_token: refreshToken}).exec();

    if(!user){
        return res.sendStatus(403);
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) =>{
            if(err || user.username!==decoded.username){
                return res.sendStatus(403);
            }

            const accessToken = jwt.sign(
                {username: decoded.username},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '1800s'}
            );
            res.json({access_token: accessToken});
        }
    )
}
async function user(req, res){
  
    const user = req.user;
    return res.status(200).json(user);
  }
module.exports = { register, login, logout, refresh, user };
