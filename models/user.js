var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); //encrypt strings, passwords
var crypto = require('crypto'); //cryptography algorithms
var Schema = mongoose.Schema;

//user's schema

var UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true},
  name: String,
  password: String,
  photo: String,
  events: [{
    event: { type: Schema.Types.ObjectId, ref: 'Event'}
  }],
  bookings: [{
    type: Schema.Types.ObjectId, ref: 'Booking'
  }],

});

//encrypt the password
UserSchema.pre('save', function(next){
  var user = this;
  if(!user.isModified('password')) return next();
  if(user.password) {
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return next();
        user.password = hash;
        next(err);
      })
    })
  }
});


//generate a random gravatar picture to associate the email to
UserSchema.methods.gravatar = function(size){
  if(!size) size = 200;
  if(!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&dretro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&dretro';
}


//compare the passwords
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);
