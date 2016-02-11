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

        var
            base_core_url    = options.core_url + options.def_api_version + "/" + options.def_api_app + '/',
            accounts_url     = options.accounts_url,
            login_url        = options.login_url,
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

        // Returns Login URL
        this.getLoginUrl = function () {
            return login_url;
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

/*global angular, console, document, $, window, URL*/
(function () {
    'use strict';

    // creating directive
    function PlgDataTable($log, $compile, $location, $http, $rootScope, core) {
        return {
            restrict: 'E',
            scope: {
                params: '=',
                serviceModule: '=',
                dynamicForm: '=',
                filterDefault: '=',
                orderBy: '=',
                limit: '=',
                page: '=',
                total: '=',
                viewItems: '=',
                gapiDataTableFilters: '=',
                paginate: '&'
            },
            replace: true,

            // linking directive
            link: function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {
                    builder = {
                        buildTemplate: function (scope, cb) {
                            var template;

                            scope.selected  = []; // DataTable - Checkbox
                            scope.chkList   = false;


                            scope.editView      = this.editView;
                            scope.toggleAll     = this.toggleAll;
                            scope.allActions    = this.allActions;


                            scope.options = {
                                autoSelect: false,
                                boundaryLinks: false,
                                largeEditDialog: false,
                                pageSelector: false,
                                rowSelection: true
                            };

                            // input init orderBy... ex: name, type_ip, etc...
                            scope.query = {
                                order: scope.orderBy
                            };


                            template =  '<md-content layout="column" flex>' +
                                        '   <md-table-container>' +
                                        '       <table md-table md-row-select="options.rowSelection" ng-model="selected" md-progress="promise" ng-click="toggleAll()">' +
                                        '       <thead md-head md-order="query.order" md-on-reorder="logOrder">' +
                                        '           <tr md-row>' +
                                        '               <th md-column md-order-by="{{ header.ref }}" ng-repeat="header in dynamicForm.showInList"><span>{{ header.label }}</span></th>' +
                                        '           </tr>' +
                                        '       </thead>' +
                                        '       <tbody md-body>' +
                                        '           <tr md-row md-select="obj" md-on-select="toggleAll" md-on-deselect="toggleAll" ng-click="editView(serviceModule.module, obj._id)" md-on-select="logItem" md-auto-select="options.autoSelect" ng-repeat="obj in params | filter: filter.search | orderBy: query.order" style="cursor: pointer !important">' +
                                        '               <td md-cell ng-repeat="item in dynamicForm.showInList">{{obj[item.ref]}}</md-cell>' +
                                        '               <td md-cell ng-show="gapiDataTableFilters">' +

                                        '                   <plg-data-table-filters' +
                                        '                       params="obj"' +
                                        '                       service-module="serviceModule"' +
                                        '                       dynamic-form="dynamicForm"' +
                                        '                       filter-default="filterDefault">' +
                                        '                   </plg-data-table-filters>' +

                                        '               </td>' +
                                        '           </tr>' +
                                        '       </tbody>' +
                                        '       </table>' +
                                        '   </md-table-container>' +

                                        '   <md-table-pagination md-limit="limit" md-page="page" md-total="{{total}}" md-on-paginate="paginate()"></md-table-pagination>' +

                                        '   <div layout="row" layout-align="start start" class="actionDataTable">' +
                                        '       <md-menu-item ng-show="chkList" ng-repeat="item in viewItems" layout-align="center center">' +
                                        '           <md-button class="md-icon-button allActionsIcon" aria-label="Ações" ng-click="allActions(item.method, item.action, item.msg)">' +
                                        '               <md-tooltip>{{item.name}}</md-tooltip>' +
                                        '               <md-icon md-svg-src="{{item.moduleIcon}}" class="icons"></md-icon>' +
                                        '           </md-button>' +
                                        '       </md-menu-item>' +
                                        '   </div>' +
                                        '</md-content>';


                            cb(null, template);
                        },

                        editView : function (path, id) {
                            $location.path(path + '/' + id);
                        },

                        // Display "show / hide" buttons, ex: Inativar, Excluir...
                        toggleAll : function () {
                            scope.chkList = false;
                            if (scope.selected.length > 0) {
                                scope.chkList = true;
                            }
                        },

                        // Execute actions ex: Inativar, Excluir...
                        allActions : function (method, action, msg) {

                            var payload = {};

                            payload[method] = action;


                            scope.selected.forEach(function (obj, index) {
                                /*jslint nomen:true*/
                                $http.patch(core.getAppCoreUrl() + scope.serviceModule.collection + '/' + obj._id, payload)
                                    .success(function (data) {
                                        if (data) {
                                            if (index + 1  === scope.selected.length) {
                                                $rootScope.$emit('saveRecordSuccess', 'Registros ' + msg + ' com sucesso.');
                                            }
                                            scope.selected.length = 0; // Reset "CHECKBOX checked"
                                            scope.chkList = false;
                                            $rootScope.$emit('research', [obj], method, action);
                                        } else {
                                            $rootScope.$emit('recordError', 'Ocorreu um erro ao ' + msg);
                                        }
                                    });
                                /*jslint nomen:false*/
                            });
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgDataTable.$inject = ['$log', '$compile', '$location', '$http', '$rootScope', 'coreApiService'];

    // registering into angular
    angular.module('plingUi').directive('plgDataTable', PlgDataTable);
}());
/*global angular, console, document, $, window, URL*/
(function () {
    'use strict';

    // creating directive
    function PlgDataTableFilters($rootScope, $log, $compile, $http, core, formatResultList) {
        return {
            restrict: 'E',
            scope: {
                params: '=',
                serviceModule: '=',
                dynamicForm: '=',
                filterDefault: '='
            },
            replace: true,

            // linking directive
            link: function (scope, element) {

                var builder, compiledElm;

                // validating bind value
                if (scope.params) {
                    builder = {
                        buildTemplate: function (scope, cb) {
                            var template;


                            scope.actionsList = this.actionsList;


                            //---------------------
                            scope.collection    = scope.serviceModule.collection;
                            scope.module        = scope.serviceModule.module;
                            if (scope.serviceModule.subModuleEdit) {
                                scope.module    = scope.serviceModule.module + '/' + scope.serviceModule.subModuleEdit;
                            }

                            scope.resultViewItems = formatResultList.action(scope.filterDefault.action, scope.serviceModule.viewItems);
                            //---------------------

                            template =  '<md-menu md-offset="0 -7" md-position-mode="target-right target">' +
                                        '    <md-button aria-label="" class="md-icon-button" ng-click="$mdOpenMenu($event)" >' +
                                        '        <md-tooltip>Ações</md-tooltip>' +
                                        '        <md-icon md-svg-src="assets/images/icone_mais.svg"></md-icon>' +
                                        '    </md-button>' +
                                        '    <md-menu-content layout="column" layout-wrap width="4" >' +
                                        '        <md-menu-item flex ng-show="module">' +
                                        '           <p><font color="#959595">Alterar Status</font></p>' +
                                        '        </md-menu-item>' +
                                        '        <md-menu-item flex ng-repeat="item in resultViewItems">' +
                                        '            <md-button ng-click="actionsList(params, \'Registro\', item, collection)" style="margin-left: 15px !important">' +
                                        '                 <md-icon md-svg-src="{{item.moduleIcon}}"></md-icon>' +
                                        '                 {{item.name}}' +
                                        '            </md-button>' +
                                        '        </md-menu-item>' +
                                        '    </md-menu-content>' +
                                        '</md-menu>';

                            cb(null, template);
                        },

                        actionsList: function (param, label, item, collection) {
                            var payload = {},
                                getParam;

                            /*jslint nomen:true*/
                            getParam                = param._id;
                            /*jslint nomen:false*/
                            payload[item.method]    = item.action;

                            $http.patch(core.getAppCoreUrl() + collection + '/' + getParam, payload)
                                .success(function (data) {
                                    if (data) {
                                        $rootScope.$emit('saveRecordSuccess', label + ' ' + item.msg + ' com sucesso.');
                                        $rootScope.$emit('research', [param], item.method, item.action);
                                    } else {
                                        $rootScope.$emit('recordError', 'Ocorreu um erro ao ' + item.msg + ' ' + collection);
                                    }
                                });
                        }

                    };

                    // defining template
                    builder.buildTemplate(scope, function (err, template) {

                        // handling error
                        if (err) {
                            $log.warn(err);
                            return;
                        }

                        // compiling template
                        compiledElm = $compile(template)(scope);

                        // handling post compile hooks
                        if (builder.postCompile) {
                            builder.postCompile(compiledElm);
                        }

                        // replacing into DOM
                        element.replaceWith(compiledElm);

                    });
                }
            }
        };
    }

    // injecting dependencies
    PlgDataTableFilters.$inject = ['$rootScope', '$log', '$compile', '$http', 'coreApiService', 'formatResultList'];

    // registering into angular
    angular.module('plingUi').directive('plgDataTableFilters', PlgDataTableFilters);
}());

/*global angular, console, document, $, jQuery, window, URL*/
(function () {
    'use strict';

    // creating directive
    function PlgDataTableSearch($log, $compile, $rootScope) {
        return {
            restrict: 'E',
            scope: {
                dynamicForm: '='
            },
            replace: true,

            // linking directive
            link: function (scope, element) {

                var builder, compiledElm;

                builder = {
                    buildTemplate: function (scope, cb) {

                        var template;

                        scope.serializeQueryString  = this.serializeQueryString;
                        scope.searchPeople          = this.searchPeople;
                        scope.searchColorActive     = this.searchColorActive;
                        scope.searchColorInactivate = this.searchColorInactivate;
                        scope.colorIconsTrash       = this.colorIconsTrash;


                        scope.search                   = [];
                        scope.searchIconsTrash         = 'checkOffColorIconFilter';
                        scope.searchIconsActive        = 'checkOffColorIconFilter';
                        scope.searchIconsInactivate    = 'checkOffColorIconFilter';


                        template =  '<div flex="25">' +
                                    '    <md-input-container>' +
                                    '        <label>Pesquisar</label>' +
                                    '        <input ng-model="search.search">' +
                                    '    </md-input-container>' +
                                    '</div>' +

                                    '<div style="margin-left: 20px !important" flex="25">' +
                                    '    <md-input-container>' +
                                    '        <md-select multiple ng-model="search.fieldtable" placeholder="Selecione">' +
                                    '            <md-option ng-repeat="table in dynamicForm.allField" value="{{table.ref}}">{{table.label}}</md-option>' +
                                    '        </md-select>' +
                                    '    </md-input-container>' +
                                    '</div>' +

                                    '<div style="margin-left: 20px !important">' +
                                    '    <md-input-container>' +
                                    '        <md-button ng-class="searchIconsActive" class="md-icon-button" ng-click="searchColorActive()">' +
                                    '            <md-tooltip md-direction="bottom">Ativos</md-tooltip>' +
                                    '            <i class="material-icons">done_all</i>' +
                                    '        </md-button>' +
                                    '        <md-button ng-class="searchIconsInactivate" class="md-icon-button" ng-click="searchColorInactivate()">' +
                                    '            <md-tooltip md-direction="bottom">Inativos</md-tooltip>' +
                                    '            <i class="material-icons">highlight_off</i>' +
                                    '        </md-button>' +
                                    '        <md-button ng-class="searchIconsTrash" class="md-icon-button" ng-click="colorIconsTrash()">' +
                                    '            <md-tooltip md-direction="bottom">Excluídos</md-tooltip>' +
                                    '            <i class="material-icons">delete</i>' +
                                    '        </md-button>' +
                                    '    </md-input-container>' +
                                    '</div>' +

                                    '<md-button ng-click="searchPeople(search)" ng-show="search.search || search.fieldtable.length > 0 || search.active || search.inactive || search.trash" class="md-raised" style="font-size: 11px !important;">Pesquisar</md-button>';

                        cb(null, template);
                    },

                    serializeQueryString : function (obj) {
                        var str = [],
                            p;

                        for (p in obj) {
                            if (obj.hasOwnProperty(p) && encodeURIComponent(obj[p])) {
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            }
                        }

                        if (str.length > 0) {
                            return '&' + str.join("&");
                        }

                        return str.join("&");
                    },

                    searchPeople : function (search) {
                        $rootScope.$emit('searchPeople', scope.serializeQueryString(search));
                    },

                    searchColorActive : function () {
                        if (scope.searchIconsActive === 'checkOffColorIconFilter') {
                            scope.searchIconsActive = 'checkOnColorIconFilter';
                            scope.search.active     = true;
                        } else {
                            scope.searchIconsActive = 'checkOffColorIconFilter';
                            delete scope.search.active;
                        }
                    },

                    searchColorInactivate : function () {
                        if (scope.searchIconsInactivate === 'checkOffColorIconFilter') {
                            scope.searchIconsInactivate = 'checkOnColorIconFilter';
                            scope.search.inactive       = true;
                        } else {
                            scope.searchIconsInactivate = 'checkOffColorIconFilter';
                            delete scope.search.inactive;
                        }
                    },

                    colorIconsTrash : function () {
                        if (scope.searchIconsTrash === 'checkOffColorIconFilter') {
                            scope.searchIconsTrash = 'checkOnColorIconFilter';
                            scope.search.trash     = true;
                        } else {
                            scope.searchIconsTrash = 'checkOffColorIconFilter';
                            delete scope.search.trash;
                        }
                    }
                };

                // defining template
                builder.buildTemplate(scope, function (err, template) {

                    // handling error
                    if (err) {
                        $log.warn(err);
                        return;
                    }

                    // compiling template
                    compiledElm = $compile(template)(scope);

                    // handling post compile hooks
                    if (builder.postCompile) {
                        builder.postCompile(compiledElm);
                    }

                    // replacing into DOM
                    element.replaceWith(compiledElm);

                });
            }
        };
    }

    // injecting dependencies
    PlgDataTableSearch.$inject = ['$log', '$compile', '$rootScope'];

    // registering into angular
    angular.module('plingUi').directive('plgDataTableSearch', PlgDataTableSearch);
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

angular.module("plingUi.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("myComponentSample.html","<div class=myComponentSample>My Component Sample: <span ng-bind=tagline></span></div>");
$templateCache.put("plgEditFabSpeedDial.template.html","");}]);