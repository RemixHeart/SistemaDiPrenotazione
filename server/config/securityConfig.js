const jwt = require('jsonwebtoken');
const KEY = process.env.TOKEN_KEY;
const db = require('../db.js');

const getTokenFromAuthHeader = (header) => {
    if (header === undefined) throw new Error('Token not supplied');

    return header.trim().substring(7);
};

const isAuth = (req, res, next) => {
    try {
        const token = getTokenFromAuthHeader(req.get('Authorization'));
        const payload = jwt.verify(token, KEY);

        const user = db
            .get('users')
            .getById(payload.userId)
            .value();

        if (user === undefined) throw new Error('User does not exist');

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send('Not Authorized');
    }
};

module.exports = isAuth;
