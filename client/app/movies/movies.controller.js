'use strict';

angular.module('vomovApp')
  .controller('MoviesController', function ($scope, $http, $interval, Auth) {
  
  $scope.page = 1;
  $scope.pageSize = 20;

  $scope.listMovies = function() {
    $http.get('/api/movies/' + Auth.getCurrentUser().name).success(function(movies) {
      $scope.movies = movies;
      $interval(function() {
        $('[data-toggle="popover"]').popover();
      }, 100, 1);
    })
  };
  
  $scope.listVolumes = function() {
    $http.get('/api/movies/' + Auth.getCurrentUser().name + '/volumes/all').success(function(volumes) {
      $scope.volumes = volumes;
      $scope.activeVolumes = volumes.slice();
    })
  };

  $scope.toggleVolume = function(volume) {
    var activeVolumes = $scope.activeVolumes;
    if (activeVolumes.indexOf(volume) > -1) {
      // Deactivate volume.
      activeVolumes.splice(activeVolumes.indexOf(volume), 1);
    } else {
      // Reactivate volume.
      activeVolumes.push(volume);
    }
    $('.vol-'+volume).toggleClass('show hidden');
    $('#vol-'+volume).toggleClass('label-success label-default');
  }

  $scope.searchMovies = function(query) {
    $http.get('/api/movies/' + Auth.getCurrentUser().name + "/?q=" + query).success(function(movies) {
      $scope.movies = movies;
      $interval(function() {
        $('[data-toggle="popover"]').popover();
      }, 100, 1);
    })
  }
});