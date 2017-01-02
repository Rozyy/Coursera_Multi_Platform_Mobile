'use strict';

angular.module('conFusion.services', ['ngResource'])
        .constant("baseURL","http://192.168.1.2:3000/")
        .factory('menuFirebaseFactory',['$firebaseArray','$firebaseObject', function($firebaseArray, $firebaseObject){
            var menuFac = {};
            menuFac.getAllDishes = function() {
                var ref = firebase.database().ref();
               return $firebaseArray(ref.child('dishes'));
            };
            menuFac.getDishForIndex = function(index) {      
                var childKey = "dishes/"+index;
                var ref = firebase.database().ref().child(childKey);
                return $firebaseObject(ref)
           };
            return menuFac;
        }])
        .factory('firebaseImagesFactory', ['$firebaseObject','$rootScope', function($firebaseObject, $rootScope) {
            var firebaseImageFac = {};
            firebaseImageFac.getImageUrlForCurrentDish = function(currentDish) {
                var storageRef = firebase.storage().ref();
                var starsRef = storageRef.child(currentDish.image);
                starsRef.getDownloadURL().then(function(url) {
                    currentDish.imageURL = url;  
                }).catch(function(error) {
                    return '';
                });
            };
            
            
            firebaseImageFac.getImageUrlForProfilePicture = function(imageName) {
                var storageRef = firebase.storage().ref();
                var starsRef = storageRef.child(imageName);
                starsRef.getDownloadURL().then(function(url) {
                    console.log("got profile pic URL:"+url);
                    $rootScope.profilePictureURL = url;  
                }).catch(function(error) {
                    console.log("error profile pic url");
                    return '';
                });
            };
            
            
            return firebaseImageFac;
            
        }])
        .factory('loginFirebaseFactory', ['$firebaseAuth', '$firebaseObject', function ($firebaseAuth, $firebaseObject) {
            var loginFunction = {};
            loginFunction.loginWithUserNameAndPassword = function(userName, password) {
                 var firebaseAuthObject = $firebaseAuth();
                 firebaseAuthObject.$signInWithEmailAndPassword(userName, password).then(function(resultMsg){
                        console.log("loin success");
                        return true;
                    }).catch(function(error) {
                        console.log("loin failes");
                        return false;
                    });
            };
            return loginFunction;

         }])
        .factory('promotionFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
            return $resource(baseURL + "promotions/:id");

         }])


        .factory('corporateFactory', ['$resource', 'baseURL', function($resource,baseURL) {
    
            console.log("Inside corporateFactory");
            return $resource(baseURL+"leadership/:id" , null, {
                'update': {
                    method: 'PUT'
                }
            });
    
        }])

        .factory('feedbackFactory', ['$resource', 'baseURL', function($resource,baseURL) {
    
    
            return $resource(baseURL+"feedback/:id");
    
        }])

   .factory('favoriteFactory', ['$resource', 'baseURL','$localStorage', function ($resource, baseURL,$localStorage) {
    var favFac = {};
    var favorites =  $localStorage.getObject('favorites','[]');

    favFac.addToFavorites  = function (index) {
        console.log("Starting now");
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id == index)
                return;
        }
         console.log("index is:" + index);
        favorites.push({id: index});
        console.log("Ending Now: End" + favorites);
        $localStorage.storeObject('favorites',favorites);
        
      
    };
       
       
       
       
      favFac.deleteFromFavorites = function (index) {
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].id == index) {
                favorites.splice(i, 1);
               
            }
        }
          $localStorage.storeObject('favorites',favorites);
    }; 
       
       
       
   favFac.getFavorites = function () {
        return favorites;
    };
    return favFac;
    }])


.factory('$localStorage', ['$window', function($window) {
  return {
    store: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    storeObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key,defaultValue) {
      return JSON.parse($window.localStorage[key] || defaultValue);
    }
  }
}])
;