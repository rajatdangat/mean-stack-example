var myApp = angular.module('myModule', ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
        .when("/blobs", {
            templateUrl: "blobList.html",
            controller: "blobListController"
        })
        .when("/blobs/:id", {
            templateUrl: "blobDetails.html",            // Yaha par sab angular hai
            controller: "blobDetailsController"
        })
        .when("/new", {
            templateUrl: "addNewBlob.html",
            controller: "addNewBlobController"
        })
        .otherwise({
            redirectTo: "/blobs"
        });
    });

myApp.controller("blobListController", function($scope, $http, formatBlob, $location, $window) {
    $http({
        mehod: 'GET',
        url: 'http://localhost:3000/blobs'
    }).then(
        function mySuccess(response) {
            $scope.blobs = response.data;
            for(let i=0; i<$scope.blobs.length; i++) {
                $scope.blobs[i].dob = formatBlob.processDOB($scope.blobs[i].dob);
            }
            console.log($scope.blobs);
            // displayData(response.data);
        },
        function myError(response) {
            $scope.blobs = response.statusText;
        }
    );

    $scope.viewDetails = function(id) {
        console.log("Clicked! "+id);
        
        // $location.href = '#!/blobDetails';
        // $location.path('#!/blobDetails').replace();
        // $scope.$apply();
        $window.location.assign('#!/blobs/'+id);
    };

    $scope.nameChk = $scope.badgeChk = $scope.dobChk = $scope.islovedChk = true;
    
});

myApp.controller("blobDetailsController", function($scope, $routeParams, $http, formatBlob, $window) {
    // console.log($routeParams.id);
    $scope.dob = new Date();
    $http({
        method: 'GET',
        params: {id: $routeParams.id},
        url: 'http://localhost:3000/blobs/'+$routeParams.id
    }).then( 
        function mySuccess(response) {
            $scope.blob = response.data;
            $scope.dob = formatBlob.processDOB($scope.blob.dob);
            console.log($scope.dob);
            
            console.log(response.data);
        },
        function myError(response) {
            console.log(response.statusText);
        }
    );

    $scope.deleteBlob = function(id) {
        $http({
            method: 'POST',
            data: {_method: 'DELETE'},
            url: 'http://localhost:3000/blobs/'+id+'/edit'
        }).then(
            function mySuccess(response) {
                console.log(response.data);
                $window.location.assign('#!/blobs');
            },
            function myError(response) {
                console.log(response.statusText);
                
            }
        );
    }

    $scope.isUpdateBlob = false;

    $scope.editBlob = function() {
        $scope.isUpdateBlob = true;
        // console.log($scope.blob.dob);
        $scope.blob.dob = new Date($scope.dob);
        // console.log($scope.dob);
        // console.log("UPDATE: "+$scope.blob.dob);
    };

    $scope.cancelEdit = function() {
        $scope.isUpdateBlob = false;
    };

    $scope.updateBlob = function(id) {
        $scope.dob = formatBlob.processDOB($scope.blob.dob.toISOString());
        $http({
            method: 'POST',
            data: {
                    _method: 'PUT',
                    name: $scope.blob.name,
                    badge: $scope.blob.badge,
                    dob: $scope.blob.dob,
                    isloved: $scope.blob.isloved
                },
            url: 'http://localhost:3000/blobs/'+id+'/edit'
        }).then(
            function mySuccess(response) {
                console.log("After update: "+response.data);
                $scope.isUpdateBlob = false;
            },
            function myError(response) {
                console.log(response.statusText);
                
            }
        );
    }
});

myApp.controller("addNewBlobController", function($scope, $http, $window) {
    $scope.blob;

    $scope.addBlob = function() {
        // console.log($scope.blob);
        $http({
            method: 'POST',
            data: $scope.blob,
            url: 'http://localhost:3000/blobs'
        }).then(
            function mySuccess(response) {
                console.log(response.data);
                $window.location.assign('#!/blobs');
            },
            function myError(response) {
                console.log(response.data);
            }
        );
    };
});

myApp.factory('formatBlob', function() {
    return {
        processDOB: function(dob) {
            return dob.substring(0, dob.indexOf('T'));
        }
    }
});