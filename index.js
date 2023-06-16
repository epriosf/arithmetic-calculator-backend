require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const corsOptions = require('./config/cors');
const connectDB = require('./config/database');
const credentials = require('./middleware/credentials');
const errorHandlerMiddleware = require('./middleware/error_handler');
const authenticationMiddleware = require('./middleware/authentication')

const app = express();
const PORT = 3500;

connectDB();

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use(authenticationMiddleware);

//static files
app.use('/static', express.static(path.join(__dirname, 'public')));

//Error handling
app.use(errorHandlerMiddleware);

//Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/operation', require('./routes/api/operation'));
app.use('/api/records', require('./routes/api/record'));
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('json')) {
        res.json({ 'error': '404 Not Found' });
    }
    else {
        res.type('text').send('404 Not Found');
    }
});

mongoose.connection.once('open', () => {
    console.log('DB connected...');
    app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });
});
