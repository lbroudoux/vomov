'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MovieSchema = new Schema({
  name: String,
  path: String,
  volume: String,
  size: String,
  creationDate: Date,
  username: String
});

module.exports = mongoose.model('Movie', MovieSchema);