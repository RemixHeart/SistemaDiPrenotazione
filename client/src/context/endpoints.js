//const SERVER_URL = 'https://sp-backend--franckdorgeless.repl.co';
const SERVER_URL = 'https://acerbisgianluca.com/node';


const endpoints = {
    login: `${SERVER_URL}/auth/login`,
    signup: `${SERVER_URL}/auth/signup`,
    getEvents: `${SERVER_URL}/events`,
    getEventById: `${SERVER_URL}/events/:id`,
    getEventsByUserId: `${SERVER_URL}/events/users/:id`,
    deleteEventById: `${SERVER_URL}/events/:id`,
    joinEventById: `${SERVER_URL}/events/:eventId/users/:userId`,
    cancelEventById: `${SERVER_URL}/events/:eventId/users/:userId`,
    getImage: `${SERVER_URL}/static/:id.jpg`,
    getUserById: `${SERVER_URL}/users/:id`,
    deleteUserById: `${SERVER_URL}/users/:id`,
};

export default endpoints;