/*global window*/
(function (context) {
    "use strict";

    // starting global context
    context.pling = {};
}(window));

/*global angular */
(function () {
    "use strict";

    // Config method
    function PlingUiConfig($provide) {
        $provide.decorator("$log", function ($delegate, shadowLogger) {
            return shadowLogger($delegate);
        });
    }

    // Run method
    function PlingUiRun(options, $injector) {
        var cache = null;

        if (options.onRun && options.onRun.cacheViews) {
            cache = $injector.get("cacheService");
            cache.cacheViews();
        }
    }

    // registering on angular
    angular.module('plingUi', ['plingUi.templates', 'ngMaterial', 'datetime' ]);
    angular.module("plingUi").config(["$provide", PlingUiConfig]);
    angular.module("plingUi").run(["boot.options", "$injector", PlingUiRun]);
}());

/*global angular*/

/* More about AngularJS Directives:
    http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-i-the-fundamentals */

(function () {
    "use strict";
    /*
        AQUI SE CRIA A DIRETIVA
    */
    angular.module('plingUi').directive('plgSample', function () {

        return {

            // E = element, A = attribute, C = class, M = comment
            restrict    : 'E',

            // Your Controller
            controller  : 'MyController',

            // Your HTML Template
            // You can also use 'template': <div>{{yourScopeVar}}</div>' intead of 'templateUrl'
            templateUrl : 'myComponentSample.html',

            // DOM manipulation
            link : function ($scope, element, attrs) {

                element.css('background-color', 'white');
                $scope.tagline = "it Works! Attrs: " + attrs;

            }
        };

    });
}());


/*global angular */
(function () {
    "use strict";

    function PlgEditFabSpeedDial() {

        return {
            restrict    : 'E',
            controller  : 'PlgEditFabSpeedDialController',
            templateUrl : 'myComponentSample.html',
            replace     : true,
            link : function (scope) {
                scope.tagline = "it Works!";
            }
        };

    }

    angular.module('plingUi').directive('plgEditFabSpeedDial', PlgEditFabSpeedDial);
}());

/*global angular, $parse*/
(function () {
    "use strict";

    angular.module('plingUi').directive('plgSetFocus', [ '$parse', '$timeout', function ($parse, $timeout) {

        return {
            restrict    : 'A',
            replace     : true,
            link        : function ($scope, element, attrs) {

                var model = $parse(attrs.plgSetFocus);

                $scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });

                element.bind('blur', function () {
                    $scope.$apply(model.assign($scope, false));
                });

            }
        };
    }]);
}());

/*global angular*/
(function () {
    'use strict';

    angular.module('plingUi').service('cepService', ['$http', 'boot.options', function ($http, options) {

        this.getCep = function (cep) {
            var uri = options.cep_url + cep;
            return $http.get(uri);
        };

    }]);
}());

/*global angular */
(function () {
    'use strict';

    angular.module('plingUi').service('coreApiService', ['boot.options', function (options) {

        var base_core_url = options.core_url + options.def_api_version + "/" + options.def_api_app + '/',
            accounts_url  = options.accounts_url,
            application_name = options.def_api_app;

        // Returns Core API Service URL based on Current Application
        this.getAppCoreUrl = function () {
            return base_core_url;
        };

        this.getAccountsCoreUrl = function () {
            return options.core_url + options.def_api_version + '/accounts/';
        };

        this.getDriveCoreUrl = function () {
            return options.core_url + options.def_api_version + '/drive/';
        };

        // Returns Accounts URL
        this.getAccountsUrl = function () {
            return accounts_url;
        };

        // Returns Application name capitalizing the first letter with UpperCase
        this.getApplicationName = function () {
            return application_name.charAt(0).toUpperCase() + application_name.slice(1);

        };

    }]);
}());

/*global window, angular*/
(function (context, logger) {
    'use strict';

    // creating namespace
    function Bootstrapper() {
        this.isBootstrapped = false;
    }

    // boot a module
    Bootstrapper.prototype.Angular = function (root, appname, source, cb) {
        var self = this;

        // loading file
        context.loader.load(source, function (err, options) {
            // checking errors...
            if (err) {
                logger.warn('Config file not loaded!');
                logger.debug(err);

            } else {
                // saving boot settings
                angular.module(appname).value('boot.options', options);
            }

            // starting app
            angular.bootstrap(root, [appname]);
            self.isBootstrapped = true;

            // calling callback
            if (cb) {
                cb(err);
            }
        });
    };

    // creating instance
    context.boot = new Bootstrapper();

}(window.pling, window.console));

/*global document, window*/
(function (dom, logger, context) {
    "use strict";

    // Content Loaded listener
    function onDOMLoaded() {

        // detect angular application "directive"
        var root,
            directive = "plg-app",
            source = "src",
            filter = "[" + directive + "]";

        // retrieving root element
        root = dom.querySelector(filter);

        // working on root
        if (root) {

            // retrieving app name
            context.name = root.getAttribute(directive);
            context.source = root.getAttribute(source) || "pling.conf.json";

            // loading config file
            logger.info('AngularJS 1.x spa check:', true);
            context.boot.Angular(root, context.name, context.source, function (err) {

                if (err) {
                    logger.error('Could not boot app ', context.name);
                } else {
                    logger.info('Bootstrapped:', context.boot.isBootstrapped);
                }

            });

        } else {
            logger.info('AngularJS 1.x spa check:', false);
        }
    }

    dom.addEventListener('DOMContentLoaded', onDOMLoaded);

}(document, window.console, window.pling));

/*global window, XMLHttpRequest*/
(function (context) {
    'use strict';
    // creating namespace
    function ConfLoader() {
        this.settings = null;
    }

    // loading file
    ConfLoader.prototype.load = function (filepath, cb) {
        var self = this,
            parsed,
            xhr = new XMLHttpRequest();

        // sending result
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {

                    parsed = JSON.parse(xhr.responseText);
                    self.settings = parsed;

                    cb(null, parsed);
                } else {
                    cb("Error loading file - status " + xhr.status, {});
                }
            }
        };

        // handling error
        xhr.onerror = function (err) {
            cb(err);
        };

        // fetching file
        xhr.open("GET", filepath, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send();
    };

    // creating instance
    context.loader = new ConfLoader();
}(window.pling));

/*global angular */
(function () {
    'use strict';

    function CachingService($templateCache, $route, $http) {


        this.cacheViews = function (cacheObj, routeObj) {
            // setting defaults
            var partial, r,
                viewCache = cacheObj || $templateCache,
                router = routeObj || $route;

            // looping routes
            for (r in router.routes) {
                // jslint -object protection
                if (router.routes.hasOwnProperty(r)) {
                    // evaluate partial
                    partial = router.routes[r].templateUrl;
                    if (partial) {
                        // caching route
                        $http.get(partial, {cache: viewCache});
                    }
                }
            }
        };
    }

    CachingService.$inject = ['$templateCache', '$route', '$http'];

    // registering service
    angular.module('plingUi').service('cacheService', CachingService);

}());

/*global angular */
(function () {
    'use strict';

    angular.module('plingUi').service('$localstorage', ['$window', function ($window) {
        return {
            remove: function () {
                $window.localStorage.clear();
            },
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key) {
                return $window.localStorage[key];
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }]);
}());

/*global angular */
(function () {
    'use strict';

    angular.module('plingUi').service('$sessionstorage', ['$window', function ($window) {
        return {
            remove: function () {
                $window.sessionStorage.clear();
            },
            set: function (key, value) {
                $window.sessionStorage[key] = value;
            },
            get: function (key) {
                return $window.sessionStorage[key];
            },
            setObject: function (key, value) {
                $window.sessionStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.sessionStorage[key] || '{}');
            }
        };
    }]);

}());

/*global angular, console*/
(function () {
    "use strict";

    // defining behaviour
    function PlingUiExceptionHandler($injector) {

        return function (exception, cause) {

            // preparing message to be dispatched
            var dispatcher = null,
                logger = null,
                data = {
                    "error": exception,
                    "details": cause
                };

            // logging
            logger = $injector.get('$log');
            logger.error(exception);

            if (cause) {
                logger.debug(cause);
            }

            // dispatching message
            dispatcher = $injector.get('$rootScope');
            dispatcher.$broadcast('PLINGUI_INTERNAL_ERROR', data);
        };
    }

    // injecting
    PlingUiExceptionHandler.$inject = ['$injector'];

    // registering on angular
    angular
        .module("plingUi")
        .factory("$exceptionHandler", PlingUiExceptionHandler);

}());

/*global angular, console*/
(function () {
    "use strict";

    // logger definition
    function PlingUiLogger() {
        return function ($delegate) {
            return {
                dispatch: function (method, params) {
                    // defining method
                    var proc = $delegate[method] || $delegate.log,
                        stamp = new Date().toString(),
                        prefix = '[' + stamp + '][' + method + ']::',
                        msg = [],
                        arg;

                    if (method) {
                        // preparing msg
                        msg.push(prefix);

                        // joining params
                        for (arg in params) {
                            if (params.hasOwnProperty(arg)) {
                                msg.push(params[arg]);
                            }
                        }

                        // applying log info
                        proc.apply(null, msg);
                    }
                },

                log: function () {
                    this.dispatch('log', arguments);
                },

                info: function () {
                    this.dispatch('info', arguments);
                },

                error: function () {
                    this.dispatch('error', arguments);
                },

                warn: function () {
                    this.dispatch('warn', arguments);
                }
            };
        };
    }

    // registering on angular
    angular
        .module("plingUi")
        .factory("shadowLogger", PlingUiLogger);
}());

angular.module("plingUi.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("myComponentSample.html","<div class=myComponentSample>My Component Sample: <span ng-bind=tagline></span></div>");
$templateCache.put("plgEditFabSpeedDial.template.html","");}]);