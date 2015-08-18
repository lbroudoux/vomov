'use strict';

angular.module('vomovApp')
  .controller('SettingsCtrl', function ($scope, $http, User, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};

    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.getNewKeys = function() {
      $http.put('/api/users/apiKey/reset').success(function() {
        Auth.refresh();
        $scope.getCurrentUser = Auth.getCurrentUser;
      })
    }
  });
