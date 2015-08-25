'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    auto_install: 'grunt-auto-install',
    nwjs: 'grunt-nw-builder'
  });

  grunt.initConfig({
    auto_install: {
      subdir: {
        options: {
          cwd: 'app',
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    },

    nwjs: {
      options: {
        platforms: ['linux32'], //['win32','win64','osx32','osx64'],
        buildDir: '../dist-tools', // Where the build version of my NW.js app is saved
        version: '0.12.3' // The version of nwjs to use
      },
      src: ['./app/**/*'] // Your NW.js app
    },
  });

  grunt.registerTask('build', [
    'auto_install',
    'nwjs'
  ]);
};
