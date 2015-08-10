'use strict';

angular.module('vomovApp')
  .controller('MoviesController', function ($scope, $http, Auth) {
  
  $scope.listMovies = function() {
    $http.get('/api/movies/' + Auth.getCurrentUser().name).success(function(movies) {
      $scope.movies = movies;
    })
  };
  
  $scope.listVolumes = function() {
    $http.get('/api/movies/' + Auth.getCurrentUser().name + '/volumes/all').success(function(volumes) {
      $scope.volumes = volumes;
    })
  };
});