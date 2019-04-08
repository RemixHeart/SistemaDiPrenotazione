var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookingSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema)