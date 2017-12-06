var app = angular.module("app", []);

app.controller("myCtrl", function($scope,$http) {
    $scope.imageSearchText = "";
    $scope.appKey="AIzaSyAhJEvHJ5H07QJGh28YcKniOO9_6-rYvcw";
    $scope.loading=false;
    $scope.googleSearch=function(){
      console.log($scope.imageSearchText);
      $scope.loading = true;
      $http({
       url: '/imageSearch',
       method: "POST",
       data: { 'text' : $scope.imageSearchText }
       })
       .then(function(response) {
               // success
               console.log(response);
               $scope.loading = false;
       },
       function(response) { // optional
               // failed
       });
    }

});
