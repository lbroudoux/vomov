'use strict';

var vomovHost = 'vomov.herokuapp.com';
var vomovPort = 80;

// Frontend related functions.
var toggleSettings = function() {
  var importP = document.querySelector('#import-panel');
  var settingsP = document.querySelector('#settings-panel');
  toggleClass('show', importP);
  toggleClass('hidden', importP);
  toggleClass('show', settingsP);
  toggleClass('hidden', settingsP);
}

function toggleClass(toggleClass, el) {
  var current = el.className.split(/\s+/)
      ,exist   = ~current.indexOf(toggleClass);
  el.className = (exist 
      ? (current.splice(-exist>>1,1), current)
      : current.concat([toggleClass])).join(' ');
}

var printStatus = function(status) {
  var span = document.getElementById('status');
  span.innerHTML = status;
}

var addProgress = function(percent) {
  var progress = document.getElementById('progress');
  var width = parseInt(progress.style.width);
  progress.style.width = (width + percent) + '%';
}

var launchImport = function() {
  directoryToScan = document.querySelector('#path').value;
  volume = document.querySelector('#volume').value;
  username = document.querySelector('#username').value;
  apiKey = document.querySelector('#apiKey').value;
  apiSecret = document.querySelector('#apiSecret').value;
  if (!username || !apiKey || !apiSecret) {
    alert('User settings must be set. See settings panel...');
  } else if (!directoryToScan || !volume) {
    alert('Missing path or volume name. Please fix.')
  } else {
    startScanning();
  }
}

function getUserHome() {
  return process.env.HOME || process.env.USERPROFILE;
}

var readSettings = function() {
  var file = getUserHome() + '/.vomov';
  jsonfile.readFile(file, function(err, obj) {
    if (err) {
      //alert('Error while reading settings: ' + err);
    } else {
      document.getElementById('username').value = obj.username;
      document.getElementById('apiKey').value = obj.apiKey;
      document.getElementById('apiSecret').value = obj.apiSecret;
    }
  });
}

var saveSettings = function() {
  username = document.querySelector('#username').value;
  apiKey = document.querySelector('#apiKey').value;
  apiSecret = document.querySelector('#apiSecret').value;
  if (!username || !apiKey || !apiSecret) {
    alert('Missing user settings for saving. Please complete...');
  }
  var file = getUserHome() + '/.vomov';
  var settings = {'username': username, 'apiKey': apiKey, 'apiSecret': apiSecret};

  jsonfile.writeFile(file, settings, function (err) {
    if (err) {
      alert('Error while saving settings: ' + err);
    }
  });
}

// Acquire every requirement.
var fs = require('fs'),
    path = require('path'),
    bytes = require('bytes'),
    http = require('http'),
    jsonfile = require('jsonfile');

// Prepare needed variables.
var directoryToScan, numberDirectories, volume, username, apiKey, apiSecret, token;
var extensions = ['.avi', '.mkv', '.mp4', '.mov'];

/**
 * Main scanning function definition.
 * Launched once prerequisites are all checked.
 */
function startScanning() {
  numberDirectories = 1 + evaluateSubDirectories(directoryToScan);
  printStatus('Found ' + numberDirectories + ' directories to scan...');
  // Proceed with authentication and let things roll...
  authenticatingToVomov();
}

/* */
var evaluateSubDirectories = function(currentPath) {
  var numberSubDirectories = 0;
  var files = fs.readdirSync(currentPath);
  for (var i in files) {
    var currentFile = currentPath + '/' + files[i];
    var stats = fs.statSync(currentFile);
    if (stats.isDirectory()) {
      numberSubDirectories++;
      numberSubDirectories = numberSubDirectories + evaluateSubDirectories(currentFile);
    }
  }
  return numberSubDirectories;
}

/* */
var authenticatingToVomov = function() {
  printStatus('Authenticating to Vomov remote API...')
  var options = {
    hostname: vomovHost,
    port: vomovPort,
    path: '/auth/oauth/access_token',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(apiKey + ':' + apiSecret).toString('base64')
    }
  };
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');
    res.on('data', function(data) {
      token = JSON.parse(data).token;
      printStatus('Authentication successfull! Now proceeding...');
      traverseFileSystem(directoryToScan);
      printStatus('Done!');
    });
    res.on('error', function(e) {
      printStatus('Problem authenticating to Vomov: ' + e.message);
    });
  });
  req.end();
}

/* */
var traverseFileSystem = function(currentPath) {
  var files = fs.readdirSync(currentPath);
  var movies = [];
  for (var i in files) {
    var currentFile = currentPath + '/' + files[i];
    var stats = fs.statSync(currentFile);
    if (stats.isFile() 
        && extensions.indexOf(path.extname(currentFile)) != -1) {
      movies.push( {name: files[i], path: currentPath, size: bytes(stats.size), 
                    creationDate: stats.ctime, volume: volume} );
    }
    else if (stats.isDirectory()) {
      traverseFileSystem(currentFile);
    }
  }
  if (movies.length > 0) {
    storeMoviesToVomov(movies);
  }
}

/* */
var storeMoviesToVomov = function(movies) {
  var dataString = JSON.stringify(movies);
  console.log("Sending: " + dataString);
  var options = {
    hostname: vomovHost,
    port: vomovPort,
    path: '/api/movies/' + username,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
      'Authorization': 'Bearer ' + token
    }
  };
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });
    res.on('error', function(e) {
      printStatus('Problem sending movies to Vomov: ' + e.message);
    });
    res.on('end', function() {
      var resultObject = JSON.parse(responseString);
      console.log('Vomov status: ' + res.statusCode);
      console.log('Vomov result: ' + JSON.stringify(resultObject));
      addProgress(Math.round(100 / numberDirectories));
    });
  });
  req.write(dataString);
  req.end();
}

// Start by reading settings.
readSettings();