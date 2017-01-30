angular.module('conFusion.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, $firebaseAuth, $firebaseObject, $state,  $ionicHistory, $rootScope, $window, reloadViewService) {
    
  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo','{}');
  $scope.reservation = {};
  $scope.registration = {};
    
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
    
  // Create the reserve modal that we will use later
  $ionicModal.fromTemplateUrl('templates/reserve.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.reserveform = modal;
  });

  // Triggered in the reserve modal to close it
  $scope.closeReserve = function() {
    $scope.reserveform.hide();
  };

  // Open the reserve modal
  $scope.reserve = function() {
    $scope.reserveform.show();
  };  
  $scope.logOut = function() {
    var firebaseAuthObject = $firebaseAuth();
    $rootScope.$broadcast("cleanUpTasks");
   // $window.localStorage.removeItem("firebase:session::myrestaurantapp-48572.firebaseio.com");
    firebaseAuthObject.$signOut().then(function() {
        $state.go('app.Login');
    }, function(error) {
        console.log("Error signing out:", error);  
    });
}
  // Perform the reserve action when the user submits the reserve form
  $scope.doReserve = function() {
    console.log('Doing reservation', $scope.reservation);
    // Simulate a reservation delay. Remove this and replace with your reservation
    // code if using a server system
    $timeout(function() {
      $scope.closeReserve();
    }, 1000);
  }; 
})
.controller('RegistrationController', ['$firebaseAuth','$firebaseObject', function($firebaseAuth, $firebaseObject){
    var fireBaseRegistrationObject = {};
    fireBaseRegistrationObject.registerWithEmailAndPassword = function(userEmail, userPassword) {
         firebase.auth().$createUserWithEmailAndPassword(userEmail, userPassword)
                .then(function(firebaseUser) {
                    console.log("User " + firebaseUser.uid + " created successfully!");
                }).catch(function(error) {
                    console.error("Error: ", error);
                });
        };
}])
.controller('RestaurantLocationController', ['$scope', '$window', function($scope, $window){
    $scope.myOriginModel = {isMyOriginLocationAvailable : false};
    $scope.myOriginModel.myOriginLocation =  "";
    $scope.getDrivingDirection = function(){
        $scope.myOriginModel.isMyOriginLocationAvailable = true;
    };
    $scope.openGoogleMapTest = function() {
         $window.open("geo:40.5727209,-74.33391460000001?q=1567 Oak Tree Rd, Iselin, NJ 08830" , '_system');
    };
}])
.controller('LoginController',['$firebaseAuth', '$firebaseObject', '$scope', '$ionicLoading', '$location','$state', '$ionicHistory', '$timeout', '$rootScope', '$ionicSideMenuDelegate', '$ionicModal','$ionicPlatform', '$cordovaCamera', 'firebaseImagesFactory', 'reloadViewService','$ionicPopup', function($firebaseAuth, $firebaseObject, $scope, $ionicLoading, $location, $state, $ionicHistory, $timeout,  $rootScope, $ionicSideMenuDelegate,  $ionicModal, $ionicPlatform, $cordovaCamera, firebaseImagesFactory, reloadViewService,$ionicPopup){

  $scope.$on('$ionicView.afterEnter', function(event) {
    $rootScope.isHideMenuButton = true;
  });
    //enable side menu drag before moving to next view
    $scope.$on('$ionicView.beforeLeave', function(event) {
       $rootScope.isHideMenuButton = false;
    });
    $scope.showLoading = function() {
            $ionicLoading.show({
            template: 'Loading...',
        }).then(function(){
            console.log("The loading indicator is now displayed");
        })
    };          
    $scope.hideLoading = function(){
            $ionicLoading.hide().then(function(){
                console.log("The loading indicator is now hidden");
            });
        };  
    $scope.loginWithUserNamePassword = function() {
            $scope.showLoading;
            var firebaseAuthObject = $firebaseAuth();
            //firebaseAuthObject.$signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).then(function(resultMsg){    
            firebaseAuthObject.$signInWithEmailAndPassword("rosysardana@gmail.com", "anvi2941").then(function(resultMsg){
                $rootScope.email = resultMsg.email;
                firebaseImagesFactory.getImageUrlForProfilePicture('profilePic/'+resultMsg.email+'.jpeg');
                $timeout(function() {        
                    }, 10000);
                //Hides back button on home screen
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.home');
                $scope.loginData.username = '';
                $scope.loginData.password = '';
                reloadViewService.resetReloadView();
            }).catch(function(error) {
                console.log("login fails");
                //Showing invalid login pop up
                var alertPopup = $ionicPopup.alert({ 
                    title: 'Login failed!',
                            template:'Either Username and Password is invalid!'
                });
            });   
        };
        
       // Create the registration modal that we will use later
        $ionicModal.fromTemplateUrl('templates/register.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.registerform = modal;
        });
        // Triggered in the registration modal to close it
        $scope.closeRegister = function () {
        $scope.registerform.hide();
    };
    // Open the registration modal
    $scope.register = function () {
        $scope.registerform.show();
    };
    // Perform the registration action when the user submits the registration form
    $scope.doRegister = function () {  
        $firebaseAuth().$createUserWithEmailAndPassword($scope.registration.email, $scope.registration.password)
                .then(function(firebaseUser) {
                    var metadata = {
                        'contentType': 'image/jpeg'
                    };
                    console.log("User " + firebaseUser.uid + " created successfully!");
                    //Need to store profile pic in case of successful registration
                    //Captured picture is in bas64 encoding. Converting to blob which can be stored in firebase
                    var storageRef = firebase.storage().ref();
                    var  contentType = 'image/jpeg';
                    var sliceSize = 512;
                    // atob function decode a base64-encoded string into a new string with a char for each byte of the binary data.
                    var byteCharacters = window.atob($scope.registration.imgContent);
                    var byteArrays = [];    
                    //create an array of byte values by applying this using the .charCodeAt method for each character 
                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        var slice = byteCharacters.slice(offset, offset + sliceSize);
                        var byteNumbers = new Array(slice.length);
                        for (var i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }
                        var byteArray = new Uint8Array(byteNumbers);
                        byteArrays.push(byteArray);
                    }
                    //Coverting to blob
                    var blob = new Blob(byteArrays, {type: contentType});
                    //Passing blob to firebase
                    storageRef.child('profilePic/'+$scope.registration.email + '.jpeg').put(blob, metadata).then(function(snapshot) {
                        console.log('Uploaded');
                    }).catch(function(error) {
                        console.error('Upload failed:', error);
                    });
                }).catch(function(error) {
                    console.error("Error: ", error);
                });
        // Simulate a registration delay. Remove this and replace with your registration
        // code if using a registration system
        $timeout(function () {
            $scope.closeRegister();
        }, 1000);
    };
     $ionicPlatform.ready(function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
         $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function(imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
                $scope.registration.imgContent = imageData;
            }, function(err) {
                console.log(err);
            });
            $scope.registerform.show();
        };
        $scope.openGallery = function () {
            var optionsCordovaImagePicker = {
              maximumImagesCount: 10,
              width: 800,
              height: 800,
              quality: 80,
              sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
            };
          $cordovaImagePicker.getPictures(optionsCordovaImagePicker).then(function (results) {
              $scope.registration.imgSrc = results[0];
            }, function(error) {
              console.log(error);
            });
          };
    });
}])
.controller('MenuController', ['$scope', 'favoriteFactory', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$firebaseArray','firebaseImagesFactory','$timeout', 'reloadViewService','menuFirebaseFactory' ,function($scope,  favoriteFactory, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast,  $firebaseArray, firebaseImagesFactory, $timeout, reloadViewService, menuFirebaseFactory) {
    console.log("menucontroller start");
     $scope.$on("cleanUpTasks", function(){
        console.log("clean up now menu");
        $scope.dishes.$destroy();
    });
      $scope.$on('$ionicView.beforeEnter', function(){
          console.log("enter menucontroller");
          if( reloadViewService.getIsReloadMenuView() == true) {
              console.log("enter menucontroller: reload");
                $scope.tab = 1;
                $scope.filtText = '';
                $scope.showDetails = false; 
                menuFirebaseFactory.getAllDishes().$loaded().then(function(data) {   
                    $scope.dishes = data;
                    angular.forEach(data, function(currentDishObj, currentDishValue) {
                        firebaseImagesFactory.getImageUrlForCurrentDish(currentDishObj);
                    });
                });
                reloadViewService.setIsReloadMenuView(false);
            }
          console.log("enter menucontroller: stop");
        });
        $scope.select = function(setTab) {
            $scope.tab = setTab;    
            if (setTab === 2) {
                $scope.filtText = "appetizer";
            } else if (setTab === 3) {
                $scope.filtText = "mains";
            } else if (setTab === 4) {
                $scope.filtText = "dessert";
            } else {
                $scope.filtText = "";
            }
         };
        $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
         };
         $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
         };
         $scope.addFavorite = function (index) {
             favoriteFactory.addToFavorites(index);
             $ionicListDelegate.closeOptionButtons();
             $ionicPlatform.ready(function () {
             $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Added Favorite",
                    text: $scope.dishes[index].name
             }).then(function () {
                    console.log('Added Favorite '+$scope.dishes[index].name);
             },
             function () {
                    console.log('Failed to add Notification ');
              });
              $cordovaToast
                    .show('Added Favorite '+$scope.dishes[index].name, 'long', 'center')
                    .then(function (success) {
                        // success
                    }, function (error) {
                      // error
                    });
                });
            };
        console.log("menucontroller end");
}])
.controller('ContactController', ['$scope', function($scope) {
    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };        
    var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];        
    $scope.channels = channels;
    $scope.invalidChannelSelection = false;                    
}])
.controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {            
    $scope.sendFeedback = function() {            
    console.log($scope.feedback);
    if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
        $scope.invalidChannelSelection = true;
    }else {
        $scope.invalidChannelSelection = false;
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
        $scope.feedback.mychannel="";
        $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
    }
 };
}])
.controller('DishDetailController', ['$scope', '$stateParams','dish', '$ionicPopover', '$ionicModal', 'menuFirebaseFactory','$firebaseArray','firebaseImagesFactory', 'favoriteFactory','$ionicPlatform','$cordovaLocalNotification', '$cordovaToast', function($scope, $stateParams, dish, $ionicPopover, $ionicModal, menuFirebaseFactory,$firebaseArray,firebaseImagesFactory, favoriteFactory,$ionicPlatform,$cordovaLocalNotification, $cordovaToast) {
    dish.$loaded().then(function(data) {
            firebaseImagesFactory.getImageUrlForCurrentDish(data);
    });
    $scope.dish = {};
    $scope.showDish = false;
    $scope.message="Loading ...";
    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.dishDetailPopover = popover;
    });
    $ionicModal.fromTemplateUrl('templates/dish-comment.html',{
        scope: $scope
    }).then(function(popover) {
        $scope.commentModal = popover;
    });
    $scope.dish = dish;
    $scope.addFavorite = function () {
        favoriteFactory.addToFavorites($scope.dish.id);
        $scope.dishDetailPopover.hide();
        $ionicPlatform.ready(function () {
        $cordovaLocalNotification.schedule({
            id: 2,
            title: "Added Favorite",
            text: $scope.dish.name
        }).then(function () {
            console.log('Added Favorite '+$scope.dish.name);
        }, function () {
            console.log('Failed to add Notification ');
        });
        $cordovaToast
            .show('Added Favorite '+$scope.dish.name, 'long', 'center')
            .then(function (success) {
                  // success
              }, function (error) {
                  // error
              });
        });
    };
    $scope.openCommentModal = function() {
        console.log('openCommentModal');
        $scope.commentModal.show();
        $scope.dishDetailPopover.hide();
    };
    $scope.closeCommentModal = function(){
        $scope.commentModal.hide();   
    };
    $scope.newComment = {rating:5, comment:"", author:"", date:""};  
    $scope.submitComment = function () {
        $scope.newComment.date = new Date().toISOString();
        console.log($scope.newComment);
        $scope.dish.comments.push($scope.newComment);
        menuFactory.update({id:$scope.dish.id},$scope.dish);
        $scope.commentModal.hide();
        $scope.newComment = {rating:5, comment:"", author:"", date:""};
    };
    $scope.openFavoriteCommentPopover = function(event) {
        console.log('event is ' + event);
        $scope.dishDetailPopover.show(event);
    }
}])
.controller('DishCommentController', ['$scope', 'menuFirebaseFactory', function($scope,menuFirebaseFactory) {            
    $scope.mycomment = {rating:5, comment:"", author:"", date:""};
    $scope.submitComment = function () {           
        $scope.mycomment.date = new Date().toISOString();
        $scope.dish.comments.push($scope.mycomment);
        menuFactory.update({id:$scope.dish.id},$scope.dish);        
        $scope.commentForm.$setPristine();
        $scope.mycomment = {rating:5, comment:"", author:"", date:""};
    }
}])
// implement the IndexController and About Controller here
.controller('IndexController', ['$scope','firebaseImagesFactory', 'menuFirebaseFactory', 'promotionFirebaseFactory',    'corporateFirebaseFactory', 'reloadViewService', function ($scope , firebaseImagesFactory, menuFirebaseFactory,         promotionFirebaseFactory, corporateFirebaseFactory, reloadViewService) { 
  console.log("indexcontroller start");
    $scope.$on("cleanUpTasks", function(){
        $scope.dish.$destroy();
        $scope.promotion.$destroy();
        $scope.leader.$destroy();
    });
    $scope.$on('$ionicView.beforeEnter', function(){
        console.log("indexcontroller before enter:: start");
        if( reloadViewService.getIsReloadHomeView() == true) {
            menuFirebaseFactory.getDishForIndex(0).$loaded().then(function(data){
                $scope.dish = data;
                firebaseImagesFactory.getImageUrlForCurrentDish(data);
            });
            promotionFirebaseFactory.getPromotionForIndex(0).$loaded().then(function(data){
                $scope.promotion = data;
                firebaseImagesFactory.getImageUrlForPromotion(data);
            });
            corporateFirebaseFactory.getLeadershipForIndex(3).$loaded().then(function(data){
                $scope.leader = data;
                firebaseImagesFactory.getImageUrlForLeadership(data);
            });
            reloadViewService.setIsReloadHomeView(false);
        }
        console.log("indexcontroller before enter::end");
    });
    $scope.showDish = true;
    console.log("indexcontroller:: end");
}])
.controller('AboutController',['$scope','corporateAboutUs','$firebaseArray','firebaseImagesFactory',
    function($scope,corporateAboutUs,$firebaseArray,firebaseImagesFactory) {                              
    $scope.leaders = corporateAboutUs;
    corporateAboutUs.$loaded().then(function(data){
             angular.forEach(data,function(currentLeadershipObj,currentLeadershipValue){
                 firebaseImagesFactory.getImageUrlForLeadership(currentLeadershipObj);
                });
    }) ;          
}])
.controller('FavoritesController', ['$scope', 'dishes','favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout','$cordovaVibration', 'firebaseImagesFactory',function ($scope, dishes,favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout,$cordovaVibration, firebaseImagesFactory) {
    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;
    $scope.favorites = favorites;
    $scope.dishes = dishes;
    console.log($scope.dishes, $scope.favorites);
    $scope.dishes.$loaded().then(function(data) {
    angular.forEach(data, function(currentDishObj, currentDishValue) {
            firebaseImagesFactory.getImageUrlForCurrentDish(currentDishObj);
        });
    });
    $scope.toggleDelete = function () {
    $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    }
    $scope.deleteFavorite = function (index) {
    var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this item?'
    });
    confirmPopup.then(function (res) {
        if (res) {
                console.log('Ok to delete');
                favoriteFactory.deleteFromFavorites(index);
                 $cordovaVibration.vibrate(100);
            } else {
                console.log('Canceled delete');
            }
        });
        $scope.shouldShowDelete = false;
    }
}])
.filter('favoriteFilter', [function () {
    return function (dishes, favorites) {
        var out = [];
        for (var i = 0; i < favorites.length; i++) {
            for (var j = 0; j < dishes.length; j++) {
                if (dishes[j].id === favorites[i].id){
                    out.push(dishes[j]);
                }                    
            }
        }
        return out;
}}]);