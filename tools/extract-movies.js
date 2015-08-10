'use strict';

// Acquire every requirement.
var fs = require('fs'),
    path = require('path'),
    winston = require('winston'),
    bytes = require('bytes'),
    http = require('http'),
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
    if (config.useVomov) {
      logger.info("Configuration has set useVomov to true, connecting to remote...");
      storeMoviesToVomov(movies);  
    } else {
      logger.info("Configuration is set to use local MongoDB...");
      storeMoviesToMongoDB(movies); 
    }
  }
};

/* */
var storeMoviesToVomov = function(movies) {
  var dataString = JSON.stringify(movies);
  logger.debug("Sending: " + dataString);
  var options = {
    hostname: 'localhost',
    port: 9000,
    path: '/api/movies/' + config.username,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString)
    }
  };
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      var resultObject = JSON.parse(responseString);
      logger.debug('Vomov status: ' + res.statusCode);
      logger.debug('Vomov result: ' + JSON.stringify(resultObject));
    });
  });
  req.write(dataString);
  req.end();
}

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

