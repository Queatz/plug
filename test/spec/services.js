'use strict';

describe('testing mock objects', function () {
    beforeEach(module('kioskServices'));

    xit('testing locks', function () {
        var lock1 = mockLock();
        var lock2 = mockLock();

        expect(lock1 && lock2).toBeDefined();
        expect(lock1.isLocked && lock2.isLocked).toBe(true);

        lock1.unlock();
        expect(lock1.isLocked).not.toBe(true);
        expect(lock2.isLocked).toBe(true);

    });
});


describe('Lock Services', function() {
    var $httpBackend, $rootScope, createController, authRequestHandler;

    // Set up the module
    beforeEach(module('kioskServices'));

    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
    }));

});

describe('User Services', function () {
    var UserServices;

    beforeEach(module('kioskServices'));

    beforeEach(inject(function ($injector) {
        UserServices = $injector.get('UserServices');
    }));

    it('testing user services', function () {
        var createPromise = UserServices.create('test1');
        var lookupPromise = UserServices.lookup('test1');

        Q.all([createPromise, lookupPromise])
            .spread((x, y) => console.log(3))
            .catch((err) => console.log(err));

    });

});
