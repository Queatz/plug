'use strict';

/**
 * @ngdoc overview
 * @name plugApp
 * @description
 * # plugApp
 *
 * Main module of the application.
 */
angular
    .module('plugApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'plugControllers'
    ]);

angular
    .module('plugApp')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'views/home.html',
                controller: 'HomeController',
                controllerAs: 'main'
            })
            .when('/terms', {
                templateUrl: 'views/terms.html',
                controller: 'TermsController',
                controllerAs: 'terms'
            })
            .when('/auth', {
                templateUrl: 'views/auth.html',
                controller: 'AuthController',
                controllerAs: 'auth'
            })
            .when('/dropoff',{
                templateUrl: 'views/dropoff.html',
                controller: 'DropoffController',
                controllerAs: 'dropoff'
            })
            .otherwise({
                redirectTo: '/home'
            });
    });

angular
    .module('plugApp')
    .constant('authEvents', {
        LOGED_IN: 'loggeg_in'
    });

angular
    .module('plugApp')
    .constant('CONFIGS', {
        DEBUG: true,
        RPI_IP: '0.0.0.0'
    });


angular
    .module('plugApp')
    .constant('activity', {
        AUTH_INACT: 150000
    });
