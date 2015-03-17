'use strict';

// Acquire every requirement.
var fs = require('fs'),
    path = require('path'),
    winston = require('winston'),
    bytes = require('bytes'),
    mongoClient = require('mongodb').MongoClient;

// Read configuration.
var config = require(path.join(__dirname, 'config.json'));

// Define logger.
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});

// Extract root path to scan.
if (process.argv.length < 3) {
  logger.error('Usage: node extract-movies.js <directory> <volume>');
  process.exit(1);
}
var directoryToScan = process.argv[2];
var volume = process.argv[3];

// Check it exists.
fs.exists(directoryToScan, function(exists) {
  if (exists) {
    logger.info('Starting movie extraction from ' + directoryToScan);
    startScanning();
  } else {
    logger.error('<directory> is not valid or readable !');
    process.exit(1);
  }
});

/**
 * Main scanning function definition.
 * Launched once prerequisites are all checked.
 */
function startScanning() {
  //
  traverseFileSystem(directoryToScan);
}

/* */
var traverseFileSystem = function(currentPath) {
  var files = fs.readdirSync(currentPath);
  var movies = [];
  for (var i in files) {
    var currentFile = currentPath + '/' + files[i];
    var stats = fs.statSync(currentFile);
    if (stats.isFile() 
        && config.extensions.indexOf(path.extname(currentFile)) != -1) {
      logger.debug('Find movie: ' + currentFile);
      movies.push( {name: files[i], path: currentPath, size: bytes(stats.size), 
                    creationDate: stats.ctime, volume: volume} );
    }
    else if (stats.isDirectory()) {
      traverseFileSystem(currentFile);
    }
  }
  if (movies.length > 0) {
    storeMoviesToMongoDB(movies); 
  }
};

/* */
var storeMoviesToMongoDB = function(movies) {  
  // Connect to the database.
  mongoClient.connect("mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.name, function(err, db) {
    if (!err) {
      insertMovies(db, movies, function() {
        db.close();
      });
    }
  });
};

/** */
var insertMovies = function(db, movies, callback) {
  // Get the movies collection
  var collection = db.collection('movies');
  collection.insert(movies, function(err, result) {
    callback(result)
  });
}

