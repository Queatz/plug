'use strict';

var plugControllers = angular.module('plugControllers',
                                     ['kioskServices', 'kioskAnimations']);


plugControllers.controller('HomeController', ['$scope', '$location',
    function ($scope, $location) {
        var name = 'HomeController: ';

        console.log(name + "at homepage");

        // This is for the notification container should not be here
        $scope.begin = function () {
            console.log(name + "screen was clicked");
            // needs the "/" to work

            $location.path('/terms');
        };

        // This is for the add container, should not be here
        $(document).ready(function(){
            $('.ads').slick({
                slidesToShow: 1,
                autoplay: true,
                autoplaySpeed: 12000,
                adaptiveHeight: true,
                arrows: false,
                useCSS: false,
                speed: 20,
                draggable: false // removes dragging; other options are pointer-event css
            });
        });
    }
]);


plugControllers.controller('TermsController', ['$scope', '$location', '$timeout',
    function ($scope, $location, $timeout) {

        // Declines after some time
        // TODO: needs to go to a configuration file
        var inactivityLength = 30 * 1000;
        var inactivity = $timeout(function () {
            $location.path('/home');
            $scope.$apply();
        }, inactivityLength);

        // Disable decline at the begging to prevent double taps
        $scope.declineDisabled = true;

        var declineTimer = $timeout(function () {
            $scope.declineDisabled = false;
        }, 1000);

        $scope.agree = function () {
            $timeout.cancel(inactivity);
            $location.path('/auth');
        };

        $scope.decline = function () {
            $timeout.cancel(inactivity);
            $location.path('/home');
        };
    }
]);

plugControllers.
    controller('AuthController',
               ['$scope', '$timeout', '$location', 'activity', 'InputServices',
                AuthController]);

function AuthController($scope, $timeout, $location, activity, InputServices) {

    // Controller setup
    var vm = this;
    vm.name = 'AuthController';
    $scope.cancel = cancel;

    console.log(vm.name);

    // The cancel button
    function cancel () {
        $location.path('/home');
    }

    // pick up logic
    function pickup () {
        $location.path('/pickup');
    }

    // drop off logic
    function dropoff () {
        $location.path('/dropoff');
    }

    // TODO: inactivity needs to be canceled
    var inactivity = $timeout(function () {
        $scope.cancel();
        $scope.$apply();
    }, activity.AUTH_INACT);


    // Get user Credentials
    var inputPromise = InputServices.readCreditCard();
    inputPromise.then((cred) => {$scope.cred = cred;
                                 $scope.$apply();
                                 console.log(cred)})
        .catch(() => console.error());

    // Log In
    var loginPromise = null;

    // Needs to update the session
    // needs to be done all the time

    // Imagine we have the user object
    console.log(testUser);
    $scope.user;
    $scope.nextAction = nextAction;


    function nextAction(user) {
        if (user.lockerId) {
            pickup ();
        } else {
            dropoff ();
        }
    }
};




plugControllers.controller('DropoffController', ['$scope', '$timeout', '$location', '$interval', '$rootScope',
    function ($scope, $timeout, $location, $interval, $rootScope) {

        console.log('The root scope is ', $rootScope.session);
        $scope.lockId = '';
        $scope.isDone = false;
        $scope.isFull = false;

        var closedTimer = '';
        var closeAction = function () {
            if (!$scope.forPickup) {
                $scope.isDone = true;
                console.log('The lock id is', $scope.lockId);
                Kiosk.add($scope.lockId).then(function (result) {
                    console.log('updating locker status', result);
                });
                console.log("The root scope is", $rootScope.session);
                AuthService.addLocker($rootScope.session, $scope.lockId);
            }
            $timeout(function () {
                $location.path('/home');
            }, 5000);
        };

        Kiosk.findEmpty().then(function (locker) {
            console.log('The result of find empty is', locker);

            $scope.lockId = locker._id;
            Lock.isOpen({lockId: locker._id}, function (lock) {
                lock.$unlock({lockId: locker._id});

                closedTimer = $interval(function () {
                    Lock.isOpen({lockId: locker._id}, function (lock) {
                        $scope.isClosed = lock.open;
                            //console.log(lock.open);
                            if (!lock.open) {
                              $interval.cancel(closedTimer);
                              closeAction();
                            }
                        });
                    }, 1000);
                });
            }).catch(function (err) {
                $scope.isFull = true;
                $scope.$apply();
                $timeout(function () {
                    $location.path('/home');
                }, 5000);
            });

        $scope.forPickup = false;

        $scope.pickup = function () {
            // show message
            $scope.forPickup = true;

            // nedd to unregister the lock
        };

    }
]);

plugControllers.controller('PickupController', ['$scope', '$timeout', '$location', '$interval', '$rootScope', 'Lock', 'Kiosk', 'AuthService',
    function ($scope, $timeout, $location, $interval, $rootScope, Lock, Kiosk, AuthService) {

        console.log('The root scope is ', $rootScope.session);
        $scope.lockId = $rootScope.lockId;
        $scope.isDone = false;

        var closedTimer = '';

        var closeAction = function () {
            $scope.isDone = true;
            console.log('The lock id is', $scope.lockId);
            Kiosk.remove($scope.lockId).then(function (result) {
                console.log('updating locker status', result);
            });
            console.log("The root scope is", $rootScope.session);
            AuthService.removeLocker($rootScope.session, $scope.lockId);

            $timeout(function () {
                $location.path('/home');
                $scope.$apply();
            }, 5000);
        };


            Lock.isOpen({lockId: $scope.lockId}, function (lock) {
                lock.$unlock({lockId: $scope.lockId});

                closedTimer = $interval(function () {
                    Lock.isOpen({lockId: $scope.lockId}, function (lock) {
                    $scope.isClosed = lock.open;
                            //console.log(lock.open);
                            if (!lock.open) {
                              $interval.cancel(closedTimer);
                              closeAction();
                            }
                    });
                }, 1000);
            });

        $scope.forPickup = false;

        $scope.pickup = function () {
            // show message
            $scope.forPickup = true;

            // nedd to unregister the lock
            $timeout(function () {
                $location.path('/home');
            }, 5000);
        };

    }
]);
