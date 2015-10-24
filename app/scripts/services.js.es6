'use strict';

/* Services */

var kioskServices;
angular
    .module('kioskServices', ['ngResource'])
    .factory('InputServices', [InputServices])
    .factory('UserServices', [UserServices])
    .factory('Lock', ['$resource', 'CONFIGS', Lock]);


kioskServices = angular.module('kioskServices');

/**
 * User Services
*/
function UserServices() {

    // load the user database
    var userdb = new PouchDB('UserDB');

    return {
        create: create,
        lookup: lookup,
        assign: assign
    };

    function create (userId) {
        return userdb.put({
            _id: userId,
            lockerId: null
        });
    }

    function lookup (userId) {
        return userdb.get(userId);
    }

    function assign(lockerId) {
        return userdb
            .get(userId)
            .then(
                (user) => userdb.
                    put(_.set(user,
                              'lockerId',
                              lockerId)));
    }

}

(function () {
    var u = UserServices();
    var x = u.create('3');
    var y = u.lookup('3');

    Q.all([x,y])
        .spread((x,y) => console.log(x, y));
})();

/**
 * Input Services
 */
function InputServices() {
    return {
        readCreditCard: readCreditCard,
        readTest: readConstant
    };

    // Implementations

    function readCreditCard () {
        return Q.fcall( () => "Credit Card Input");
    }

    function readConstant () {
        return Q.fcall( () => 'TEST INPUT' );
    }
}


/*
 * Lock resources
 */
function Lock($resource, CONFIGS) {
        var rpURL = CONFIGS.RPI_IP;
        return $resource(rpURL + '/lock/:lockId',
        {},
        {
            'unlock': {method: 'PUT'},
            'isOpen': {method: 'GET'}
        }
    );
}

/*
 * Credit Card Reader
 */
function CCReader($q) {

    var PythonShell = require('python-shell');
    var options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: './'
    };

    function ccInput(

        // return a promise
        var getUserAuthPromise = $q(function (resolve, reject) {
            PythonShell
                .run('reader.py', options, function (err, result) {
                    if (err) {
                        reject(err);
                    } else if (result.length != 1) {
                        reject(new Error("Input Length not equal to 1"));
                    } else if (result[0] == 'ERROR') {
                        reject(new Error("The reader resulted in an Error"));
                    } else {
                        resolve(result[0]);
                    }
                });
        });
        return getUserAuthPromise;
    };
}


function Kiosk() {

    var kioskdb,
        numberOfEmptyLockers,
        status;

    var LOCKER_STATUS = {
        EMPTY: 'locker_empty',
        ASSIGNED: 'locker_assigned',
        INUSE: 'locker_inuse',
        OFFLINE: 'locker_offline'
    };

    // Implementations

    function isFull () {
        return numberOfEmptyLockers == 0;
    }

    function findEmpty () {
        return kioskdb
            .allDocs({include_docs: true})
            .then(
                function (result) {
                    var lockers = result.rows.map(function (result) {
                        return result.doc;
                    });

                    console.log("The result of lockers is", result);
                    return lockers;
                })
            .then(
                // pick up an empty locker
                function (lockers) {
                    var emptyLockers = _.filter(lockers,
                                                'status',
                                                LOCKER_STATUS.EMPTY);
                    var emptyLockerId = _.sample(emptyLockers);
                    if (emptyLockers) {
                        return emptyLockerId;
                    } else {
                        throw new Error("No empty lockers")
                    }
                });

    }

    // DB init
    kioskdb = new PouchDB('KioskDB');

    function _init() {
        var emptydb,
            corruptdb,
            validdb;

        return kioskdb
            .info()
            .then(
                (dbInfo) => {
                    var result;
                    if (dbInfo.doc_count == 0) {
                        result = _init(kioskdb);
                    } else if (dbInfo.doc_count != 8) {
                        result = new Error("Corrupt kioskDB");
                    }
                    return result;
                });
    }

    function _initdb (kioskdb) {
        var lockIds = ['0', '1', '2', '3', '4', '5', '6', '7'];

        lockIds.forEach(function (lockId) {
            kioskdb.put({_id: lockId, status: LOCKER_STATUS.EMPTY})
                .catch(function (error) {
                    console.err(error);
                });
        });
        numberOfEmptyLockers = 8;
    };



    function assignLocker(lockId) {
        return kioskdb.get(lockId)
            .then(
                function (locker) {
                    if(_.isEqual(locker.status, LOCKER_STATUS.EMPTY)) {
                        // use lodash _.set
                        locker.status = LOCKER_STATUS.ASSIGNED;
                        return kioskdb.put(locker);
                    } else {
                        throw new Error('Tries to assing non-empty locker');
                    }
                }
            );
    }

    function clearLocker(lockId) {
        return kioskdb.get(lockId)
            .then(
                function (locker) {
                    locker.status = LOCKER_STATUS.EMPTY;
                    return kioskdb.put(locker);
                }
            );
    }

    return kioskResource;
}

function DBServices() {
    // implements the database services including user lookup
    var authService = {
        creditCardAuth: undefined,
    };

    var authdb = new PouchDB('AuthDB');
    //PouchDB.debug.enable('*');
    var authdbRemote = new PouchDB('http://localhost:5984/authdb');

    function _initDb() {

    }


    authdb.sync(authdbRemote, {
        live: true
    }).on('change', function (change) {
        // yo, something changed!
    }).on('error', function (err) {
        // yo, we got an error! (maybe the user went offline?)
    });


}

function AuthServices ($rootScope, $http, $q) {

    return {
        login: login
    };

    var authdb;
    (function () {
        authdb = new PouchDB('AuthDB');
        console.log('Authentication DB is loaded');

        authdb
            .info()
            .then(
                (result) => console.log("authdb: info", result))
            .catch(
                (err) => console.error("authdb: error", err));
    })();

    function lookupCred (credentials) {
        return authdb
            .get(credentials)
            .then(
                // user login was in the DB
                function (loginInfo) {
                    return loginInfo.userId;
                })
            .catch(
                // user login was not in DB
                function (err) {
                    console.error(err);
                    throw new Error("User Login Was not In DB");
                }
            );
    }

    function registerCred (credentials, userId) {
        return authdb.
            put({
                _id: credentials,
                userId: userId
            });
    }

    function lookupUser (userId) {
        return UserServices.lookup(userId);
    }

    function createUser (userId) {
        // needs to add the user to authdb
        return UserServices
            .create(userId);
    }

}

var testUser = {
    _id: 'test-user',
    lockerId: null
};

function nextAction(user) {
    if (user.lockerId) {
        // route to pickup
    } else {
        // route to dropoff
    }
}


kioskServices.factory('AuthService', ['$rootScope', '$http', '$q',
    function ($rootScope, $http, $q) {

        authService.login = function (credentials) {
            var user = {};
            user._id = credentials;

            return authdb.get(credentials).then(
                function (session) {
                    if (session.lockId == undefined) {
                        session.goal = 'dropoff';
                    } else {
                        session.goal = 'pickup';
                        $rootScope.lockId = session.lockId;
                        console.log('The log id is', $rootScope.lockId);
                    }
                    return session;
                },
                function (error) {
                    var session = {};
                    session._id = credentials;
                    session.goal = 'dropoff';

                    // this is a promise
                    authdb.put(session);
                    return session;
                });
        };

        authService.addLocker = function (credentials, lockId) {
            return authdb.get(credentials).then(
                function (session) {
                    session.lockId = lockId;
                    authdb.put(session);
                    return session;
                }
            );
        };

        authService.removeLocker = function (credentials, lockId) {
            return authdb.get(credentials).then(
                function (session) {
                    session.lockId = undefined;
                    authdb.put(session);
                    return session;
                }
            );
        };

        return authService;
    }
]);



kioskServices.service('Session', [
    function () {

        var EVENTS = {
            CREATED: 'new_session_created',
            TIMEDOUT: 'session_timedout',
            AUTHENTICATED: 'session_authenticated'
        };

        this._eventsList = [];

        this.create = function () {
            var sessionTime = moment();

            this.sessionId = sessionTime.format();
            this.sessionStatus = EVENTS.CREATED;
        };

        // change update to an internal function and eventList

        this.update = function (eventId) {
            this.sessionStatus = eventId;
            this._sessionEvents.push({
                event: eventId,
                eventTime: moment()
            });
        };

        this.clear = function () {
            this.sessionId = null;
            this.sessionStatus = null;
            this._sessionEvents = [];
        };
}]);
