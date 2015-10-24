'use strict';

describe('Controller: HomeController', function () {

    // load the controller's module
    beforeEach(module('plugControllers'));

    var HomeController,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        HomeController = $controller('HomeController', {
            $scope: scope
            // place here mocked dependencies
        });
    }));

    it('just a test', function () {
        expect(3).toBe(3);
    });
});

describe('Controller: Terms&Condition', function () {

    // load the controller's module
    beforeEach(module('plugControllers'));

    var TermsController,
        scope,
        timeout;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $timeout) {
        scope = $rootScope.$new();
        timeout = $timeout;
        TermsController = $controller('TermsController', {
            $scope: scope,
            $timeout: timeout
            // place here mocked dependencies
        });
    }));

    it('test agree and decline', function () {
        expect(scope.agree).toBeDefined();
        expect(scope.decline).toBeDefined();

    });

    describe('Testing timeout functions', function () {
        it('test disable button behavior', function () {
            expect(scope.declineDisabled).toBe(true);
            timeout.flush();
            expect(scope.declineDisabled).not.toBe(true);
        });
    });
});

describe('Controller: AuthController', function () {

    // load the controller's module
    beforeEach(module('plugControllers'));

    var AuthController,
        scope,
        timeout;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $timeout) {
        scope = $rootScope.$new();
        timeout = $timeout;
        AuthController = $controller('AuthController', {
            $scope: scope,
            $timeout: timeout
            // place here mocked dependencies
        });
    }));
});
