angular.module('conFusion', ['ionic', 'ngCordova', 'conFusion.controllers','conFusion.services', 'firebase', 'ngMap'])
.run(function($ionicPlatform, $rootScope, $ionicLoading, $cordovaSplashscreen, $timeout) {
     $ionicPlatform.ready(function(){
    
    
    if(window.cordova && window.cordova.plugins.keyboard){
        cordova.plugins.keyboard.hidekeyboardAccesaryBar(true);
        cordova.plugins.keyboard.disableScroll(true);
    }
    if(window.StatusBar){
        StatusBar.styleDefault();
    }
         
         $timeout(function(){
                $cordovaSplashscreen.hide();
      },2000); 
});
     $rootScope.$on('loading:show', function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> Loading ...'
        })
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function () {
        console.log('Loading ...');
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function () {
        console.log('done');
        $rootScope.$broadcast('loading:hide');
    });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })
  
  .state('app.Login', {
    url: '/Login',
    views: {
      'mainContent': {
        templateUrl: 'templates/login.html',
          controller: 'LoginController'
      }
    }
  })
  .state('app.Register', {
    url: '/Register',
    views: {
      'mainContent': {
        templateUrl: 'templates/register.html',
          controller: 'RegistrationController'
      }
    }
  })
  
.state('app.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/home.html',
          controller: 'IndexController'
      }
    }
  })
  
  .state('app.aboutus', {
      url: '/aboutus',
      views: {
        'mainContent': {
          templateUrl: 'templates/aboutus.html',
            controller: 'AboutController',
            resolve: {
                corporateAboutUs: ['corporateFirebaseFactory',function(corporateFirebaseFactory){
                      return corporateFirebaseFactory.getAllLeaders();
                    
                }]
            }
        }
      }
    })

   .state('app.contactus', {
      url: '/contactus',
      views: {
        'mainContent': {
          templateUrl: 'templates/contactus.html'
        }
      }
    })
  
  .state('app.favorites', {
      url: '/favorites',
      views: {
        'mainContent': {
          templateUrl: 'templates/favorites.html',
            controller:'FavoritesController',
          resolve: {
              dishes:  ['menuFirebaseFactory', function(menuFirebaseFactory){
                return menuFirebaseFactory.getAllDishes();
              }],
                            favorites: ['favoriteFactory', function(favoriteFactory) {
                  return favoriteFactory.getFavorites();
              }]
          }
        }
      }
    })
    .state('app.menu', {
      url: '/menu',
      views: {
        'mainContent': {
          templateUrl: 'templates/menu.html',
          controller: 'MenuController'
        }
      }
    })

  .state('app.dishdetails', {
    url: '/menu/:id',
    views: {
      'mainContent': {
        templateUrl: 'templates/dishdetail.html',
        controller: 'DishDetailController',
        resolve: {
            dish: ['$stateParams','menuFirebaseFactory', function($stateParams, menuFirebaseFactory){
                return menuFirebaseFactory.getDishForIndex($stateParams.id);
            }]
        }
      }
    }
  })
  .state('app.restaurantLocation', {
    url: '/restaurantLocation',
    views: {
      'mainContent': {
        templateUrl: 'templates/restaurantMap.html',
        controller: 'RestaurantLocationController'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/Login');

});