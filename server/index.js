require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const multer = require('multer');
const morgan = require('morgan');
const authRoute = require('./routes/authRoute');
const eventsRoute = require('./routes/eventsRoute');
const usersRoute = require('./routes/usersRoute');
const PORT = process.env.PORT;

const app = express();

// Utility middlewares
app.use(
    morgan(
        ':method :url :status Auth::req[Authorization] :response-time ms - :res[content-length]'
    )
);
app.use(cors({ exposedHeaders: ['Authorization'] }));
app.use(helmet());
app.use(bodyParser.json());
app.use((err, req, res, next) => {
    // It checks error throwed by body parser (malformed json, ecc)
    if (err.status >= 400) return res.status(err.status).send('Bad request');

    next();
});

// Routes
app.use('/auth', authRoute);
app.use('/events', eventsRoute);
app.use('/users', usersRoute);
app.use('/static', express.static(__dirname + '/uploads/events'));
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).send('Image too large');
    }
    console.log('ERROR:', err);
    next();
});

app.all('*', (req, res) => res.status(405).send('Method not allowed'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
