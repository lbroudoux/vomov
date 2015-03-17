'use strict';

// Acquire every requirement.
var fs = require('fs'),
    path = require('path'),
    winston = require('winston'),
    mongoClient = require('mongodb').MongoClient;

// Read configuration.
var config = require(path.join(__dirname, 'config.json'));

// Define logger.
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});

// Writable stream for output.
var wstream = fs.createWriteStream('movies.csv');
wstream.write('name,volume,path,size,creationDate\n');

/* */
var readMoviesFromMongoDB = function(callback) {  
  // Connect to the database.
  mongoClient.connect("mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name, function(err, db) {
    if (!err) {
      logger.info('Querying MongoDB collection');
      var collection = db.collection('movies');
      var stream = collection.find({}, {sort: 'name'}).stream();
      stream.on('error', function(err) {
        console.error(err);
      });
      stream.on('data', function(movie) {
        wstream.write('"' + movie.name + '",' + movie.volume + ',' + movie.path + ',' + movie.size + ',"' + movie.creationDate + '"\n');
      })
      stream.on('close', function(movie) {
        db.close();
        callback();
      })
    }
  });
};

readMoviesFromMongoDB(function() {
  logger.info('Done !');
  wstream.end();
});