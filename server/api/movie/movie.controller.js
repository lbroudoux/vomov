/**
 * Naming convention for endpoints.
 * GET    /movies/:username        ->  list
 * GET    /movies/:username/:id    ->  show
 * POST   /movies/:username        ->  importMovies
 * GET    /movies/:username/volume/:volume    ->  listVolume
 * DELETE /movies/:username/volume/:volume    ->  removeVolume
 */
'use strict';

var _ = require('lodash');
var Movie = require('./movie.model');

// Get list of movies for username
exports.list = function(req, res) {
  Movie.find({'username': req.params.username}, function (err, movies) {
    if (err) { return handleError(res, err); }
    return res.json(200, movies);
  });
};

exports.show = function(req, res) {
  Movie.findById(req.params.id, function (err, movie) {
    if (err) { return handleError(res, err); }
    if (!movie) { return res.send(404); }
    return res.json(movie);
  });
};

exports.importMovies = function(req, res) {
  var movies = req.body;
  if (movies && movies.length > 0) {
    movies.forEach(function(movie, index, array) {
      movie.username = req.params.username;
    });
    Movie.create(movies, function(err, movies) {
      if (err) { return handleError(res, err); }
      return res.json(201, {imported: movies.length});
    });
  } else {
    return res.json(400, {message: 'No movies in body'});
  }
};

exports.listVolumes = function(req, res) {
  Movie.distinct('volume', 'username' == req.params.username, function (err, movies) {
    console.log('Volumes: ' + JSON.stringify(movies));
    if (err) { return handleError(res, err); }
    return res.json(200, movies);
  });
};

exports.listVolume = function(req, res) {
  Movie.find({'username': req.params.username, 'volume': req.params.volume}, function (err, movies) {
    if (err) { return handleError(res, err); }
    return res.json(200, movies);
  });
};

exports.removeVolume = function(req, res) {
  Movie.remove({'username': req.params.username, 'volume': req.params.volume}, function (err, movies) {
    if (err) { return handleError(res, err); }
    return res.json(200, movies);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}