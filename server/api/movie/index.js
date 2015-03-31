'use strict';

var express = require('express');
var controller = require('./movie.controller');

var router = express.Router();

router.get('/:username', controller.list);
router.get('/:username/:id', controller.show);
router.post('/:username', controller.importMovies);
router.get('/:username/volume/:volume', controller.listVolume);
router.delete('/:username/volume/:volume', controller.removeVolume);

module.exports = router;