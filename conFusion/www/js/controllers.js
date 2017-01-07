angular.module('conFusion.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker, $firebaseAuth, $firebaseObject, $state,  $ionicHistory) {
    

    
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

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);
        $localStorage.storeObject('userinfo',$scope.loginData);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
    
    
   

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
    firebase.auth().signOut().then(function() {
        console.log("Signed out");
        $state.go('app.Login');
    }, function(error) {
        console.log("Error signing out:", error);  
    });
    console.log("done");
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
.controller('LoginController',['$firebaseAuth', '$firebaseObject', '$scope', '$ionicLoading', '$location','$state', '$ionicHistory', '$timeout', '$rootScope', '$ionicSideMenuDelegate', '$ionicModal','$ionicPlatform', '$cordovaCamera', 'firebaseImagesFactory', function($firebaseAuth, $firebaseObject, $scope, $ionicLoading, $location, $state, $ionicHistory, $timeout,  $rootScope, $ionicSideMenuDelegate,  $ionicModal, $ionicPlatform, $cordovaCamera, firebaseImagesFactory){
    
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
            console.log("Login Start::");
            $scope.showLoading;
                var firebaseAuthObject = $firebaseAuth();
             firebaseAuthObject.$signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).then(function(resultMsg){    
            //firebaseAuthObject.$signInWithEmailAndPassword("rosysardana@gmail.com", "Rosy2941").then(function(resultMsg){
                        console.log(resultMsg.email);
                                $rootScope.email = resultMsg.email;
                                firebaseImagesFactory.getImageUrlForProfilePicture('profilePic/'+resultMsg.email+'.jpeg');
                                  $timeout(function() {        
    }, 10000);
                       $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                     $state.go('app.home');
                     console.log("Register End");
                     
                    }).catch(function(error) {
                        console.log("loin failes");
                      
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
                console.log("here is pucture daat");
                console.log(imageData);
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
              console.log("Open Gallery Started");
          $cordovaImagePicker.getPictures(optionsCordovaImagePicker).then(function (results) {
                            console.log("Open Gallery result at 1");
              $scope.registration.imgSrc = results[0];
              console.log("Open Gallery result at 2");
              
            }, function(error) {
              console.log("Open Gallery result at 3");
              console.log(error);
            });
          };
    });
    
    
    
}])
.controller('MenuController', ['$scope', 'dishes', 'favoriteFactory', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', '$firebaseArray','firebaseImagesFactory','$timeout', function ($scope, dishes, favoriteFactory, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast,  $firebaseArray, firebaseImagesFactory, $timeout) {
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.dishes = dishes;
            $scope.dishes.$loaded().then(function(data) {
                angular.forEach(data, function(currentDishObj, currentDishValue) {
                    firebaseImagesFactory.getImageUrlForCurrentDish(currentDishObj);
                });
            });
             
      $timeout(function() {        
    }, 2000);
  
    
            $scope.select = function(setTab) {
                $scope.tab = setTab;
                
                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
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
                console.log("index is " + index);
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

                
            }
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
                    console.log('incorrect');
                }
                else {
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
        console.log("calling function to create pop over");
        $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
            scope: $scope
        }).then(function(popover) {
            console.log("popover defined ")
            $scope.dishDetailPopover = popover;
        });
        console.log("pop over created");
        $ionicModal.fromTemplateUrl('templates/dish-comment.html',{
        scope: $scope
        }).then(function(popover) {
            $scope.commentModal = popover;
        });
        $scope.dish = dish;
        $scope.addFavorite = function () {
            console.log("current;y selected dish is " + $scope.dish.id);
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
                console.log($scope.mycomment);
                
                $scope.dish.comments.push($scope.mycomment);
        menuFactory.update({id:$scope.dish.id},$scope.dish);
                
                $scope.commentForm.$setPristine();
                
                $scope.mycomment = {rating:5, comment:"", author:"", date:""};
            }
        }])

        // implement the IndexController and About Controller here

.controller('IndexController', ['$scope','dish','corporate','promotion','$firebaseArray','firebaseImagesFactory', '$firebaseObject', function ($scope, dish,corporate,promotion , $firebaseArray , firebaseImagesFactory,$firebaseObject) {
                        $scope.showDish = true;
                        $scope.dish = dish;
            dish.$loaded().then(function(data) {
               firebaseImagesFactory.getImageUrlForCurrentDish(data);
            });
             $scope.promotion = promotion;
            promotion.$loaded().then(function(data){
                firebaseImagesFactory.getImageUrlForPromotion(data);
            });
            $scope.leader = corporate;
        
      corporate.$loaded().then(function(data){
          firebaseImagesFactory.getImageUrlForLeadership(data);
      });
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



.controller('FavoritesController', ['$scope', 'dishes','favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout','$cordovaVibration',function ($scope, dishes,favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout,$cordovaVibration) {
      $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $scope.favorites = favorites;

    $scope.dishes = dishes;
         console.log($scope.dishes, $scope.favorites);

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
.filter('favoriteFilter', function () {
    return function (dishes, favorites) {
        var out = [];
        for (var i = 0; i < favorites.length; i++) {
            for (var j = 0; j < dishes.length; j++) {
                if (dishes[j].id === favorites[i].id)
                    out.push(dishes[j]);
            }
        }
        return out;

    }});