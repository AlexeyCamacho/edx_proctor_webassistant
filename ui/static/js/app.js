'use strict';

/**
 *
 * Main module of the application.
 */
(function () {
    var app = angular.module('proctor', [
        'ngRoute',
        'websocket'
    ]);
    app.config(function ($routeProvider, $controllerProvider, $locationProvider, $compileProvider, $filterProvider, $provide, $httpProvider) {
        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.routeProvider = $routeProvider;
        app.filter = $filterProvider.register;
        app.service = $provide.service;
        app.factory = $provide.factory;

        app.path = window.rootPath;

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $routeProvider
            .when('/', {
                templateUrl: app.path + 'ui/home/view.html',
                controller: 'MainCtrl',
                resolve: {
                    deps: function(resolver){
                        return resolver.load_deps([
                            app.path + 'ui/home/hmController.js'
                        ]);
                    }
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    });

    app.run(function ($rootScope, $location) {
        var domain;
        var match = $location.absUrl().match(/(?:https?:\/\/)?(?:www\.)?(.*?)\//);
        if (match !== null)
            domain = match[1];
        var apiPort = '';
        $rootScope.apiConf = {
            domain: domain,
            ioServer: domain + (apiPort?':' + apiPort:''),
            apiServer: 'http://' + domain + (apiPort?':' + apiPort:'') + '/api'
        };

        $rootScope.errors = null;
        $rootScope.msg = null;
    });

    app.factory('resolver', function ($rootScope, $q, $timeout) {
        return {
            load_deps: function (dependencies, callback) {
                var deferred = $q.defer();
                $script(dependencies, function () {
                    $timeout(function () {
                        $rootScope.$apply(function () {
                            deferred.resolve();
                            if (callback !== undefined)
                                callback();
                        });
                    });
                });
                return deferred.promise;
            }
        };
    });

    app.controller('MainController', ['$scope', function($scope){

    }]);

})();
