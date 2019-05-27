const express = require('express');
const multer = require('multer');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/events');
    },
    filename: (req, file, cb) => {
        req.fileId = Date.now();
        cb(null, req.fileId + '.jpg');
    },
});
const fileFilter = (req, file, cb) => {
    if (file.originalname.endsWith('.jpg')) return cb(null, true);

    req.file = file;
    cb(null, false);
};
const upload = multer({
    fileFilter: fileFilter,
    storage: storage,
    limits: { fileSize: 2000000 },
});
const isAuth = require('../config/securityConfig');
const db = require('../db');
const { query, body, validationResult } = require('express-validator/check');

const router = express.Router();

/* const event = {
    name: "",
    description: "",
    place: {
        lon: 21343324,
        lat: 34435435,
    },
    dateStart: 213141334,
    dateFinish: 1243234355,
    owner: "",
    joinedUsers: [],
    maxSeats: 1234,
	imageId: 2313123
} */

router.get(
    '/',
    [
        query('name', 'Name not valid')
            .optional()
            .isString()
            .not()
            .isEmpty(),
        query('limit', 'Limit not valid')
            .optional()
            .isInt({ min: 1 }),
        query('index', 'Index not valid')
            .optional()
            .isInt(),
        query('date', 'Date not valid')
            .optional()
            .isISO8601(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const limit = req.query.limit | 20;
        const index = req.query.index | 0;
        const name = req.query.name ? req.query.name.toLowerCase() : undefined;
        const date = Date.parse(req.query.date) | Date.now();

        const eventsCollection = db.get('events');
        let events;
        if (name === undefined)
            events = eventsCollection
                .filter((event) => event.dateStart > date)
                .sortBy(['dateStart'])
                .slice(index, limit)
                .value();
        else
            events = eventsCollection
                .filter(
                    (event) =>
                        event.name.toLowerCase().includes(name) &&
                        event.dateStart > date
                )
                .sortBy(['dateStart'])
                .slice(index, limit)
                .value();

        const responseEvents = events.map((event) => {
            const responseEvent = {
                id: event.id,
                name: event.name,
                description: event.description,
                place: {
                    lon: event.place.lon,
                    lat: event.place.lat,
                },
                dateStart: event.dateStart,
                dateFinish: event.dateFinish,
                owner: event.owner,
                maxSeats: event.maxSeats,
                imageId: event.imageId,
            };
            return responseEvent;
        });

        res.json(responseEvents);
    }
);

router.get('/:id', (req, res) => {
    const eventId = req.params.id;
    const event = db
        .get('events')
        .getById(eventId)
        .value();

    if (event === undefined) return res.status(404).send('Not found');

    const responseEvent = {
        id: event.id,
        name: event.name,
        description: event.description,
        place: {
            lon: event.place.lon,
            lat: event.place.lat,
        },
        dateStart: event.dateStart,
        dateFinish: event.dateFinish,
        owner: event.owner,
        maxSeats: event.maxSeats,
        imageId: event.imageId,
    };

    res.json(responseEvent);
});

router.get(
    '/users/:id',
    isAuth,
    [
        query('mode', 'Mode not valid')
            .exists()
            .isIn(['joined', 'created']),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const userId = req.params.id;
        const mode = req.query.mode;
        if (mode === 'joined' && userId !== req.user.id)
            return res.status(401).send('Not authorized');

        const user = db
            .get('users')
            .getById(userId)
            .value();
        if (user === undefined) return res.status(404).send('Not found');

        if (mode === 'joined') res.json(user.joinedEvents);
        if (mode === 'created') res.json(user.createdEvents);
    }
);

router.post('/:eventId/users/:userId', isAuth, (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;

    if (userId !== req.user.id) return res.status(401).send('Not authorized');

    const event = db
        .get('events')
        .getById(eventId)
        .value();

    if (event === undefined) return res.status(404).send('Not found');

    if (event.owner === userId || event.joinedUsers.includes(userId))
        return res.status(403).send('Forbidden');

    if (event.joinedUsers.length === event.maxSeats)
        return res.status(400).send('Bad request');

    const user = db
        .get('users')
        .getById(userId)
        .value();

    if (user === undefined) return res.status(404).send('Not found');

    const updatedEvent = db
        .get('events')
        .getById(eventId)
        .get('joinedUsers')
        .push(user.id)
        .write();

    const updatedUser = db
        .get('users')
        .getById(userId)
        .get('joinedEvents')
        .push(event.id)
        .write();

    res.status(200).json(updatedEvent);
});

router.post(
    '/',
    isAuth,
    upload.single('image'),
    (req, res, next) => {
        if (!req.file) return res.status(400).send('Image not provided');
        else if (!req.fileId) return res.status(400).send('Wrong image');
        next();
    },
    [
        body('name', 'Name not valid')
            .exists()
            .isString()
            .not()
            .isEmpty(),
        body('description', 'Description not valid')
            .exists()
            .isString()
            .not()
            .isEmpty(),
        body('place', 'Place not valid')
            .exists()
            .isLatLong(),
        body('dateStart', 'Date Start not valid')
            .exists()
            .isISO8601()
            .custom((value) => Date.parse(value) > Date.now()),
        body('dateFinish', 'Date Finish not valid')
            .exists()
            .isISO8601()
            .custom(
                (value, { req }) =>
                    Date.parse(value) > Date.parse(req.body.dateStart)
            ),
        body('maxSeats', 'Max seats not valid')
            .exists()
            .isInt(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const name = req.body.name;
        const description = req.body.description;
        const [lat, lon] = req.body.place.split(',');
        const dateStart = Date.parse(req.body.dateStart);
        const dateFinish = Date.parse(req.body.dateFinish);
        const maxSeats = req.body.maxSeats;
        const fileId = req.fileId;

        const event = {
            name: name,
            description: description,
            place: {
                lat: lat,
                lon: lon,
            },
            dateStart: dateStart,
            dateFinish: dateFinish,
            owner: req.user.id,
            joinedUsers: [],
            maxSeats: maxSeats,
            imageId: fileId,
        };

        const addedEvent = db
            .get('events')
            .insert(event)
            .write();

        const addedUser = db
            .get('users')
            .getById(req.user.id)
            .get('createdEvents')
            .push(addedEvent.id)
            .write();

        res.json(addedEvent);
    }
);

router.put(
    'events/:id',
    isAuth,
    [
        body('name', 'Name not valid')
            .exists()
            .isString()
            .not()
            .isEmpty(),
        body('description', 'Description not valid')
            .exists()
            .isString()
            .not()
            .isEmpty(),
        body('place', 'Place not valid')
            .exists()
            .isLatLong(),
        body('dateStart', 'Date Start not valid')
            .exists()
            .isISO8601()
            .custom((value) => Date.parse(value) > Date.now()),
        body('dateFinish', 'Date Finish not valid')
            .exists()
            .isISO8601()
            .custom(
                (value, { req }) =>
                    Date.parse(value) > Date.parse(req.body.dateStart)
            ),
        body('maxSeats', 'Max seats not valid')
            .exists()
            .isInt(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array({ onlyFirstError: true }));

        const eventId = req.params.id;

        const name = req.body.name;
        const description = req.body.description;
        const [lat, lon] = req.body.place.split(',');
        const dateStart = Date.parse(req.body.dateStart);
        const dateFinish = Date.parse(req.body.dateFinish);
        const maxSeats = req.body.maxSeats;

        const updatedEvent = {
            name: name,
            description: description,
            place: {
                lat: lat,
                lon: lon,
            },
            dateStart: dateStart,
            dateFinish: dateFinish,
            owner: req.user.id,
            maxSeats: maxSeats,
        };

        const event = db
            .get('events')
            .updateById(eventId, updatedEvent)
            .write();

        if (event === undefined) return res.status(404).send('Not found');

        res.json(updatedEvent);
    }
);

router.delete('/:id', isAuth, (req, res) => {
    const eventId = req.params.id;

    const event = db
        .get('events')
        .getById(eventId)
        .value();

    if (event === undefined) return res.status(404).send('Event not foudnd');

    if (event.owner !== req.user.id) return res.status(403).send('Forbidden');

    const usersCollection = db.get('users');

    const deletedOwner = usersCollection
        .getById(event.owner)
        .get('createdEvents')
        .remove((eventRef) => eventRef === event.id)
        .write();

    const deletedUsers = usersCollection
        .forEach((user) =>
            db._.remove(user.joinedEvents, (eventRef) => eventRef === event.id)
        )
        .write();

    const deletedEvent = db
        .get('events')
        .removeById(event.id)
        .write();

    fs.unlinkSync(`${__dirname}/../uploads/events/${event.imageId}.jpg`);

    res.json({ id: deletedEvent.id });
});

router.delete('/:eventId/users/:userId', isAuth, (req, res) => {
    const eventId = req.params.eventId;
    const userId = req.params.userId;

    if (req.user.id !== userId) return res.status(403).send('Forbidden');

    const event = db
        .get('events')
        .getById(eventId)
        .value();
    if (event === undefined) return res.status(404).send('Event not found');

    if (event.joinedUsers.includes(userId)) {
        const deletedPrenotation = db
            .get('events')
            .getById(eventId)
            .get('joinedUsers')
            .remove((user) => user === userId)
            .write();

        const deletedUser = db
            .get('users')
            .getById(userId)
            .get('joinedEvents')
            .remove((event) => event === eventId)
            .write();

        return res.json({ msg: 'deleted' });
    } else {
        return res.status(404).send('User not found');
    }
});

module.exports = router;
