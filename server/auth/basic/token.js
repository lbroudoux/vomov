'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TokenSchema = new Schema({
  token: String,
  username: String,
  creationDate: {type: Date, default: Date.now },
  updateDate: {type: Date, expires: 36000, default: Date.now }
});

module.exports = mongoose.model('Token', TokenSchema);