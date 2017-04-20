angular.module('Jyap.routings', ['ionicUIRouter'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: 'HomeController'
      })
      .state('game', {
        url: '/game',
        templateUrl: 'templates/game.html',
        controller: 'GameController'
      })
      .state('app.home', {
        url: '/home',
        views: {
          'app-home': {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
          }
        }
      })

      .state('app.rooms', {
        url: '/rooms',
        views: {
          'app-rooms': {
            templateUrl: 'templates/rooms.html',
            controller: 'HomeController'
          }
        }
      })
      .state('app.login', {
        url: '/login',
        views: {
          'app-login': {
            templateUrl: 'templates/login.html',
            controller: 'HomeController'

          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
  });