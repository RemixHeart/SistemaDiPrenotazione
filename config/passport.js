var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');

//store user id in the seesion -> when user logs in
passport.serializeUser((user, done) => {
  done(null, user.id);
})

//retrieves the stored user id from the sesssion
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
})

//Authentication Strategy
passport.use('local-login', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (err) {
      return done(err);
    }
    if(!user) {
      return done(null, false, req.flash('login Error', 'User Not Found!'));
    }
    if (!user.comparePassword(password)) {
      return done(null, false, req.flash('login Error', 'Wrong Password!'));
    }
    return done(null, user);
  });
}));
