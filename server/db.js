const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const lodashId = require('lodash-id');
const shortid = require('shortid');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.DB_ENCRYPTION_KEY);

/* const adapter = new FileSync('db.json', {
	serialize: (obj) => cryptr.encrypt(JSON.stringify(obj)),
	deserialize: (string) => JSON.parse(cryptr.decrypt(string)),
}); */
const adapter = new FileSync('db.json');
const db = lowdb(adapter);

lodashId.createId = (collectionName, item) => shortid.generate();

db._.mixin(lodashId);

db.defaults({
    events: [],
    users: [],
}).write();

db.read();
console.log('File loaded: ', db.getState());

module.exports = db;
