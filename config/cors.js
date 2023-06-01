const allowedorigins = require('./allowed_origins');

const corsOptions = {
    origin: (origin, callback) => {
        if (!allowedorigins.includes(origin) || !origin) {
            callback(null, true);
        }
        else {
            callback(new error('not allowed by cors'));
        }

    }
};
module.exports = corsOptions;