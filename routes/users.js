var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var passportConfig = require('../config/passport');


//SIGNUP
router.route('/signup')
  .get((req, res, next) => {
    res.render('accounts/signup', { message: req.flash('errors') });
  })
  .post((req, res, next) => {
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', 'Email address already in use');
        res.redirect('/signup');
      }
      else{
        var user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = req.body.password;
        user.photo = user.gravatar();
        user.save(function(err) {
          //allows the saving of another user signup on the same session
          req.logIn(user, function(err) {
            if (err) return next(err);
            res.redirect('/');
          })
        });

      }
    });
  });

//LOGIN
router.route('/login')
  .get((req, res, next) => {
    if(req.user) res.redirect('/');
    res.render('accounts/login', { message: req.flash('login Error')});
  })
  .post(passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
