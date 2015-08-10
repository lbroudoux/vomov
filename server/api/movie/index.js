'use strict';

var express = require('express');
var controller = require('./movie.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:username', auth.isAuthenticated(), controller.list);
router.get('/:username/:id', auth.isAuthenticated(), controller.show);
router.post('/:username', auth.isAuthenticated(), controller.importMovies);
router.get('/:username/volume/:volume', auth.isAuthenticated(), controller.listVolume);
router.delete('/:username/volume/:volume', auth.isAuthenticated(), controller.removeVolume);
router.get('/:username/volumes/all', auth.isAuthenticated(), controller.listVolumes);

module.exports = router;