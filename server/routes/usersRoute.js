const express = require('express');
const { query, body, validationResult } = require('express-validator/check');
const isAuth = require('../config/securityConfig');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

/* const user = {
    id: 1234,
    name: "",
    surname: "",
    email: "",
    password: "",
    joinedEvents: [],
    createdEvents: []
} */

router.get(
    '/',
    [
        query('name', 'Name not provided')
            .exists()
            .isString()
            .not()
            .isEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const name = req.query.name;

        let users = db
            .get('users')
            .filter((user) => user.name.includes(name))
            .value();

        if (users.length === 0) return res.status(404).send('User not found');

        const responseUsers = users.map((user) => {
            const responseUser = {
                id: user.id,
                name: user.name,
                surname: user.surname,
                createdEvents: user.createdEvents,
            };
            return responseUser;
        });

        res.json(responseUsers);
    }
);

router.get('/:id', (req, res) => {
    const id = req.params.id;

    let user = db
        .get('users')
        .getById(id)
        .value();

    if (user === undefined) return res.status(404).send('User not found');

    const responseUser = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        createdEvents: user.createdEvents,
    };

    res.json(responseUser);
});

router.put(
    '/:id',
    isAuth,
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
        const userId = req.params.id;
        if (userId !== req.user.id)
            return res.status(401).send('Not authorized');

        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;
        const surname = req.body.surname;

        const updatedUser = {
            name: name,
            surname: surname,
            email: email,
            password: password,
        };

        const user = db
            .get('users')
            .updateById(id, updatedUser)
            .write();

        if (user === undefined) return res.status(404).send('User not found');

        res.json(user);
    }
);

router.delete('/:id', isAuth, (req, res) => {
    const userId = req.params.id;
    if (userId !== req.user.id) return res.status(401).send('Not authorized');

    const deletedUser = db
        .get('users')
        .removeById(userId)
        .write();

    if (deletedUser === undefined)
        return res.status(404).send('User not found');

    deletedUser.createdEvents.forEach((event) => {
        const removedEvent = db
            .get('events')
            .removeById(event)
            .write();

        fs.unlinkSync(
            `${__dirname}/../uploads/events/${removedEvent.imageId}.jpg`
        );

        const userCollection = db.get('users');

        userCollection.value().forEach((user) => {
            userCollection
                .getById(user.id)
                .get('joinedEvents')
                .remove((userEvent) => userEvent === event)
                .write();
        });
    });

    deletedUser.joinedEvents.forEach((event) => {
        db.get('events')
            .getById(event)
            .get('joinedUsers')
            .remove((user) => user === deletedUser.id)
            .write();
    });

    res.json({ userId: deletedUser.id });
});

module.exports = router;
