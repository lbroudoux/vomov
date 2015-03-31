'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var utils = require('./utils')
var Token = require('./token')

var router = express.Router();

router.post('/access_token', function(req, res, next) {
  passport.authenticate('basic', {session: false}, function (err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});
    
    var uid = utils.uid(64);
    var token = {username: user.name, token: uid};
    Token.create(token, function(err, token) {
      if (err) { return handleError(res, err); }
      return res.json(201, {token: uid});
    })
  })(req, res, next)
});

module.exports = router;