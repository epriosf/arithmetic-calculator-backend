function auth(req, res, next) {
    if (req.user?.username) {
        return next();
    }
    return res.sendStatus(401);
}
module.exports = auth;
