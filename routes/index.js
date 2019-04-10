var express = require('express');
var async = require('async');
var router = express.Router();
var User = require('../models/user');
var Tweet = require('../models/tweet');
/* GET home page. */
router.get('/', (req, res, next) => {
  if(req.user) {

    Tweet.find({})
      .sort('-created')
      .populate('owner') //fill owner attributes
      .exec((err, tweets) => { //pass all the tweets the user has got
        if (err) return next(err);
        console.log(tweets);
        res.render('main/home', { tweets: tweets});
      });
  }
  else res.render('main/index', { title: 'Express' });
});

router.get('/user/:id', (req, res, next) =>{
  async.waterfall([
    function(callback) {
      Tweet.find({ owner: req.params.id}) //find all tweets that belong to the user
        .populate('owner')
        .exec(function(err, tweets) {
          callback(err, tweets)
        });
    },
    function(tweets, callback) {
      User.findOne({ _id: req.params.id })
        .populate('following')
        .populate('followers')
        .exec(function(err, user) {
          var follower = user.followers.some(function(f) { //check to see if he follows this user
            return f.equals(req.user._id);
          });
          var currentUser;
          if (req.user._id.equals(user._id)) {
            currentUser = true;
          }
          else {
            currentUser = false;
          }
          res.render('main/user', { foundUser: user,
             tweets: tweets,
             currentUser: currentUser,
             follower: follower});
        });
    }
  ]);
});

router.post('/follow/:id', (req, res, next) => {
  async.parallel([
    function(callback) {
      User.update(
        {
          _id: req.user._id,
          following: { $ne: req.params.id }
        },
        {
          $push: { following: req.params.id }
        }, function(err, count) {
          callback(err, count);
        }
      )
    },

    function(callback) {
      User.update(
        {
          _id: req.params.id,
          followers: { $ne: req.user._id }
        },
        {
          $push: { followers: req.user._id }
        }, function(err, count) {
          callback(err, count);
        }
      )
    }
  ], function(err, results) {
    if (err) return next(err);
    res.json("Success");
  });
});



router.post('/unfollow/:id', (req, res, next) => {
  async.parallel([
    function(callback) {
      User.update(
        {
          _id: req.user._id,
        },
        {
          $pull: { following: req.params.id }
        }, function(err, count) {
          callback(err, count);
        }
      )
    },

    function(callback) {
      User.update(
        {
          _id: req.params.id,
        },
        {
          $pull: { followers: req.user._id }
        }, function(err, count) {
          callback(err, count);
        }
      )
    }
  ], function(err, results) {
    if (err) return next(err);
    res.json("Success");
  });
});

module.exports = router;
