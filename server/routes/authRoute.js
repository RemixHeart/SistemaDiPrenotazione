const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const KEY = process.env.TOKEN_KEY;
const tokenConfig = require('../config/tokenConfig.js');
const db = require('../db');

const router = express.Router();

router.post(
    '/login',
    [
        body('email', 'Email not valid')
            .exists()
            .isEmail(),
        body('password', 'Password not valid')
            .exists()
            .isLength({ min: 6 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const email = req.body.email;
        const password = req.body.password;

        const user = db
            .get('users')
            .find({ email: email })
            .value();

        if (user === undefined) return res.status(404).send('User not found');

        if (!bcrypt.compareSync(password, user.password))
            return res.status(401).send('Not Authorized');

        const token = jwt.sign({ userId: user.id }, KEY, tokenConfig);
        res.set('Authorization', `Bearer ${token}`);

        res.json({ userId: user.id });
    }
);

router.post(
    '/signup',
    [
        body('email', 'Email not valid')
            .exists()
            .isEmail(),
        body('password', 'Password not valid')
            .exists()
            .isLength({ min: 6 }),
        body('name', 'Name not valid')
            .exists()
            .isString()
            .not()
            .isEmpty(),
        body('surname', 'Surname not valid')
            .exists()
            .isString()
            .not()
            .isEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;
        const surname = req.body.surname;

        const users = db.get('users');

        const user = users.find({ email: email }).value();

        if (user !== undefined)
            return res.status(400).send('User already exists');

        const newUser = {
            email: email,
            password: bcrypt.hashSync(password),
            name: name,
            surname: surname,
            joinedEvents: [],
            createdEvents: [],
        };

        const createdUser = users.insert(newUser).write();

        res.status(201).json({ userId: createdUser.id });
    }
);

module.exports = router;
