var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  date: Date,
  bookings: [{
    type: Schema.Types.ObjectId, ref: 'Booking'
  }],
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema)
