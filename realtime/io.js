const async = require('async');
const Booking = require('../models/booking');
const User = require('../models/user');

module.exports = function(io) {

  io.on('connection', function(socket) {
    console.log("Connected");
    var user = socket.request.user;
    console.log(user.name);


    socket.on('Booking', (data) => {
      console.log(data);
      async.parallel([
        function(callback) {
          io.emit('incomingBookings', { data, user });
        },

        function(callback) {
          async.waterfall([
            function(callback) {
              var booking = new Booking();
              booking.content = data.content;
              booking.owner = user._id;
              booking.save(function(err) {
                callback(err, booking);
              })

            },

            function(booking, callback) {
              User.update(
                {
                  _id: user._id
                },
                {
                  $push: { bookings: { booking: booking._id }},

                }, function(err, count) {
                  callback(err, count);// end of the code
                }
              );
            }
          ]);
        }
      ]);
    });
  });



}
