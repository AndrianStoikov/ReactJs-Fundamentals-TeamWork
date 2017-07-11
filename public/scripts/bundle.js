(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports['default'] = makeAction;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

var _AltUtils = require('../utils/AltUtils');

var utils = _interopRequireWildcard(_AltUtils);

var _isPromise = require('is-promise');

var _isPromise2 = _interopRequireDefault(_isPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function makeAction(alt, namespace, name, implementation, obj) {
  var id = utils.uid(alt._actionsRegistry, String(namespace) + '.' + String(name));
  alt._actionsRegistry[id] = 1;

  var data = { id: id, namespace: namespace, name: name };

  var dispatch = function dispatch(payload) {
    return alt.dispatch(id, payload, data);
  };

  // the action itself
  var action = function action() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var invocationResult = implementation.apply(obj, args);
    var actionResult = invocationResult;

    // async functions that return promises should not be dispatched
    if (invocationResult !== undefined && !(0, _isPromise2['default'])(invocationResult)) {
      if (fn.isFunction(invocationResult)) {
        // inner function result should be returned as an action result
        actionResult = invocationResult(dispatch, alt);
      } else {
        dispatch(invocationResult);
      }
    }

    if (invocationResult === undefined) {
      utils.warn('An action was called but nothing was dispatched');
    }

    return actionResult;
  };
  action.defer = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return setTimeout(function () {
      return action.apply(null, args);
    });
  };
  action.id = id;
  action.data = data;

  // ensure each reference is unique in the namespace
  var container = alt.actions[namespace];
  var namespaceId = utils.uid(container, name);
  container[namespaceId] = action;

  // generate a constant
  var constant = utils.formatAsConstant(namespaceId);
  container[constant] = id;

  return action;
}
module.exports = exports['default'];
},{"../functions":2,"../utils/AltUtils":7,"is-promise":34}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMutableObject = isMutableObject;
exports.eachObject = eachObject;
exports.assign = assign;
var isFunction = exports.isFunction = function isFunction(x) {
  return typeof x === 'function';
};

function isMutableObject(target) {
  var Ctor = target.constructor;

  return !!target && Object.prototype.toString.call(target) === '[object Object]' && isFunction(Ctor) && !Object.isFrozen(target) && (Ctor instanceof Ctor || target.type === 'AltStore');
}

function eachObject(f, o) {
  o.forEach(function (from) {
    Object.keys(Object(from)).forEach(function (key) {
      f(key, from[key]);
    });
  });
}

function assign(target) {
  for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    source[_key - 1] = arguments[_key];
  }

  eachObject(function (key, value) {
    return target[key] = value;
  }, source);
  return target;
}
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _flux = require('flux');

var _StateFunctions = require('./utils/StateFunctions');

var StateFunctions = _interopRequireWildcard(_StateFunctions);

var _functions = require('./functions');

var fn = _interopRequireWildcard(_functions);

var _store = require('./store');

var store = _interopRequireWildcard(_store);

var _AltUtils = require('./utils/AltUtils');

var utils = _interopRequireWildcard(_AltUtils);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* global window */


var Alt = function () {
  function Alt() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Alt);

    this.config = config;
    this.serialize = config.serialize || JSON.stringify;
    this.deserialize = config.deserialize || JSON.parse;
    this.dispatcher = config.dispatcher || new _flux.Dispatcher();
    this.batchingFunction = config.batchingFunction || function (callback) {
      return callback();
    };
    this.actions = { global: {} };
    this.stores = {};
    this.storeTransforms = config.storeTransforms || [];
    this.trapAsync = false;
    this._actionsRegistry = {};
    this._initSnapshot = {};
    this._lastSnapshot = {};
  }

  Alt.prototype.dispatch = function () {
    function dispatch(action, data, details) {
      var _this = this;

      this.batchingFunction(function () {
        var id = Math.random().toString(18).substr(2, 16);

        // support straight dispatching of FSA-style actions
        if (action.hasOwnProperty('type') && action.hasOwnProperty('payload')) {
          var fsaDetails = {
            id: action.type,
            namespace: action.type,
            name: action.type
          };
          return _this.dispatcher.dispatch(utils.fsa(id, action.type, action.payload, fsaDetails));
        }

        if (action.id && action.dispatch) {
          return utils.dispatch(id, action, data, _this);
        }

        return _this.dispatcher.dispatch(utils.fsa(id, action, data, details));
      });
    }

    return dispatch;
  }();

  Alt.prototype.createUnsavedStore = function () {
    function createUnsavedStore(StoreModel) {
      var key = StoreModel.displayName || '';
      store.createStoreConfig(this.config, StoreModel);
      var Store = store.transformStore(this.storeTransforms, StoreModel);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);
    }

    return createUnsavedStore;
  }();

  Alt.prototype.createStore = function () {
    function createStore(StoreModel, iden) {
      var key = iden || StoreModel.displayName || StoreModel.name || '';
      store.createStoreConfig(this.config, StoreModel);
      var Store = store.transformStore(this.storeTransforms, StoreModel);

      /* istanbul ignore next */
      if (module.hot) delete this.stores[key];

      if (this.stores[key] || !key) {
        if (this.stores[key]) {
          utils.warn('A store named ' + String(key) + ' already exists, double check your store ' + 'names or pass in your own custom identifier for each store');
        } else {
          utils.warn('Store name was not specified');
        }

        key = utils.uid(this.stores, key);
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var storeInstance = fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);

      this.stores[key] = storeInstance;
      StateFunctions.saveInitialSnapshot(this, key);

      return storeInstance;
    }

    return createStore;
  }();

  Alt.prototype.generateActions = function () {
    function generateActions() {
      var actions = { name: 'global' };

      for (var _len3 = arguments.length, actionNames = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        actionNames[_key3] = arguments[_key3];
      }

      return this.createActions(actionNames.reduce(function (obj, action) {
        obj[action] = utils.dispatchIdentity;
        return obj;
      }, actions));
    }

    return generateActions;
  }();

  Alt.prototype.createAction = function () {
    function createAction(name, implementation, obj) {
      return (0, _actions2['default'])(this, 'global', name, implementation, obj);
    }

    return createAction;
  }();

  Alt.prototype.createActions = function () {
    function createActions(ActionsClass) {
      var _this3 = this;

      var exportObj = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var actions = {};
      var key = utils.uid(this._actionsRegistry, ActionsClass.displayName || ActionsClass.name || 'Unknown');

      if (fn.isFunction(ActionsClass)) {
        fn.assign(actions, utils.getPrototypeChain(ActionsClass));

        var ActionsGenerator = function (_ActionsClass) {
          _inherits(ActionsGenerator, _ActionsClass);

          function ActionsGenerator() {
            _classCallCheck(this, ActionsGenerator);

            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
              args[_key5] = arguments[_key5];
            }

            return _possibleConstructorReturn(this, _ActionsClass.call.apply(_ActionsClass, [this].concat(args)));
          }

          ActionsGenerator.prototype.generateActions = function () {
            function generateActions() {
              for (var _len6 = arguments.length, actionNames = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                actionNames[_key6] = arguments[_key6];
              }

              actionNames.forEach(function (actionName) {
                actions[actionName] = utils.dispatchIdentity;
              });
            }

            return generateActions;
          }();

          return ActionsGenerator;
        }(ActionsClass);

        for (var _len4 = arguments.length, argsForConstructor = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          argsForConstructor[_key4 - 2] = arguments[_key4];
        }

        fn.assign(actions, new (Function.prototype.bind.apply(ActionsGenerator, [null].concat(argsForConstructor)))());
      } else {
        fn.assign(actions, ActionsClass);
      }

      this.actions[key] = this.actions[key] || {};

      fn.eachObject(function (actionName, action) {
        if (!fn.isFunction(action)) {
          exportObj[actionName] = action;
          return;
        }

        // create the action
        exportObj[actionName] = (0, _actions2['default'])(_this3, key, actionName, action, exportObj);

        // generate a constant
        var constant = utils.formatAsConstant(actionName);
        exportObj[constant] = exportObj[actionName].id;
      }, [actions]);

      return exportObj;
    }

    return createActions;
  }();

  Alt.prototype.takeSnapshot = function () {
    function takeSnapshot() {
      for (var _len7 = arguments.length, storeNames = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        storeNames[_key7] = arguments[_key7];
      }

      var state = StateFunctions.snapshot(this, storeNames);
      fn.assign(this._lastSnapshot, state);
      return this.serialize(state);
    }

    return takeSnapshot;
  }();

  Alt.prototype.rollback = function () {
    function rollback() {
      StateFunctions.setAppState(this, this.serialize(this._lastSnapshot), function (storeInst) {
        storeInst.lifecycle('rollback');
        storeInst.emitChange();
      });
    }

    return rollback;
  }();

  Alt.prototype.recycle = function () {
    function recycle() {
      for (var _len8 = arguments.length, storeNames = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        storeNames[_key8] = arguments[_key8];
      }

      var initialSnapshot = storeNames.length ? StateFunctions.filterSnapshots(this, this._initSnapshot, storeNames) : this._initSnapshot;

      StateFunctions.setAppState(this, this.serialize(initialSnapshot), function (storeInst) {
        storeInst.lifecycle('init');
        storeInst.emitChange();
      });
    }

    return recycle;
  }();

  Alt.prototype.flush = function () {
    function flush() {
      var state = this.serialize(StateFunctions.snapshot(this));
      this.recycle();
      return state;
    }

    return flush;
  }();

  Alt.prototype.bootstrap = function () {
    function bootstrap(data) {
      StateFunctions.setAppState(this, data, function (storeInst, state) {
        storeInst.lifecycle('bootstrap', state);
        storeInst.emitChange();
      });
    }

    return bootstrap;
  }();

  Alt.prototype.prepare = function () {
    function prepare(storeInst, payload) {
      var data = {};
      if (!storeInst.displayName) {
        throw new ReferenceError('Store provided does not have a name');
      }
      data[storeInst.displayName] = payload;
      return this.serialize(data);
    }

    return prepare;
  }();

  // Instance type methods for injecting alt into your application as context

  Alt.prototype.addActions = function () {
    function addActions(name, ActionsClass) {
      for (var _len9 = arguments.length, args = Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
        args[_key9 - 2] = arguments[_key9];
      }

      this.actions[name] = Array.isArray(ActionsClass) ? this.generateActions.apply(this, ActionsClass) : this.createActions.apply(this, [ActionsClass].concat(args));
    }

    return addActions;
  }();

  Alt.prototype.addStore = function () {
    function addStore(name, StoreModel) {
      for (var _len10 = arguments.length, args = Array(_len10 > 2 ? _len10 - 2 : 0), _key10 = 2; _key10 < _len10; _key10++) {
        args[_key10 - 2] = arguments[_key10];
      }

      this.createStore.apply(this, [StoreModel, name].concat(args));
    }

    return addStore;
  }();

  Alt.prototype.getActions = function () {
    function getActions(name) {
      return this.actions[name];
    }

    return getActions;
  }();

  Alt.prototype.getStore = function () {
    function getStore(name) {
      return this.stores[name];
    }

    return getStore;
  }();

  Alt.debug = function () {
    function debug(name, alt, win) {
      var key = 'alt.js.org';
      var context = win;
      if (!context && typeof window !== 'undefined') {
        context = window;
      }
      if (typeof context !== 'undefined') {
        context[key] = context[key] || [];
        context[key].push({ name: name, alt: alt });
      }
      return alt;
    }

    return debug;
  }();

  return Alt;
}();

exports['default'] = Alt;
module.exports = exports['default'];
},{"./actions":1,"./functions":2,"./store":6,"./utils/AltUtils":7,"./utils/StateFunctions":8,"flux":16}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

var _transmitter = require('transmitter');

var _transmitter2 = _interopRequireDefault(_transmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AltStore = function () {
  function AltStore(alt, model, state, StoreModel) {
    var _this = this;

    _classCallCheck(this, AltStore);

    var lifecycleEvents = model.lifecycleEvents;
    this.transmitter = (0, _transmitter2['default'])();
    this.lifecycle = function (event, x) {
      if (lifecycleEvents[event]) lifecycleEvents[event].publish(x);
    };
    this.state = state;

    this.alt = alt;
    this.preventDefault = false;
    this.displayName = model.displayName;
    this.boundListeners = model.boundListeners;
    this.StoreModel = StoreModel;
    this.reduce = model.reduce || function (x) {
      return x;
    };
    this.subscriptions = [];

    var output = model.output || function (x) {
      return x;
    };

    this.emitChange = function () {
      return _this.transmitter.publish(output(_this.state));
    };

    var handleDispatch = function handleDispatch(f, payload) {
      try {
        return f();
      } catch (e) {
        if (model.handlesOwnErrors) {
          _this.lifecycle('error', {
            error: e,
            payload: payload,
            state: _this.state
          });
          return false;
        }

        throw e;
      }
    };

    fn.assign(this, model.publicMethods);

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register(function (payload) {
      _this.preventDefault = false;

      _this.lifecycle('beforeEach', {
        payload: payload,
        state: _this.state
      });

      var actionHandlers = model.actionListeners[payload.action];

      if (actionHandlers || model.otherwise) {
        var result = void 0;

        if (actionHandlers) {
          result = handleDispatch(function () {
            return actionHandlers.filter(Boolean).every(function (handler) {
              return handler.call(model, payload.data, payload.action) !== false;
            });
          }, payload);
        } else {
          result = handleDispatch(function () {
            return model.otherwise(payload.data, payload.action);
          }, payload);
        }

        if (result !== false && !_this.preventDefault) _this.emitChange();
      }

      if (model.reduce) {
        handleDispatch(function () {
          var value = model.reduce(_this.state, payload);
          if (value !== undefined) _this.state = value;
        }, payload);
        if (!_this.preventDefault) _this.emitChange();
      }

      _this.lifecycle('afterEach', {
        payload: payload,
        state: _this.state
      });
    });

    this.lifecycle('init');
  }

  AltStore.prototype.listen = function () {
    function listen(cb) {
      var _this2 = this;

      if (!fn.isFunction(cb)) throw new TypeError('listen expects a function');

      var _transmitter$subscrib = this.transmitter.subscribe(cb);

      var dispose = _transmitter$subscrib.dispose;

      this.subscriptions.push({ cb: cb, dispose: dispose });
      return function () {
        _this2.lifecycle('unlisten');
        dispose();
      };
    }

    return listen;
  }();

  AltStore.prototype.unlisten = function () {
    function unlisten(cb) {
      this.lifecycle('unlisten');
      this.subscriptions.filter(function (subscription) {
        return subscription.cb === cb;
      }).forEach(function (subscription) {
        return subscription.dispose();
      });
    }

    return unlisten;
  }();

  AltStore.prototype.getState = function () {
    function getState() {
      return this.StoreModel.config.getState.call(this, this.state);
    }

    return getState;
  }();

  return AltStore;
}();

exports['default'] = AltStore;
module.exports = exports['default'];
},{"../functions":2,"transmitter":67}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transmitter = require('transmitter');

var _transmitter2 = _interopRequireDefault(_transmitter);

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var StoreMixin = {
  waitFor: function () {
    function waitFor() {
      for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }

      if (!sources.length) {
        throw new ReferenceError('Dispatch tokens not provided');
      }

      var sourcesArray = sources;
      if (sources.length === 1) {
        sourcesArray = Array.isArray(sources[0]) ? sources[0] : sources;
      }

      var tokens = sourcesArray.map(function (source) {
        return source.dispatchToken || source;
      });

      this.dispatcher.waitFor(tokens);
    }

    return waitFor;
  }(),
  exportAsync: function () {
    function exportAsync(asyncMethods) {
      this.registerAsync(asyncMethods);
    }

    return exportAsync;
  }(),
  registerAsync: function () {
    function registerAsync(asyncDef) {
      var _this = this;

      var loadCounter = 0;

      var asyncMethods = fn.isFunction(asyncDef) ? asyncDef(this.alt) : asyncDef;

      var toExport = Object.keys(asyncMethods).reduce(function (publicMethods, methodName) {
        var desc = asyncMethods[methodName];
        var spec = fn.isFunction(desc) ? desc(_this) : desc;

        var validHandlers = ['success', 'error', 'loading'];
        validHandlers.forEach(function (handler) {
          if (spec[handler] && !spec[handler].id) {
            throw new Error(String(handler) + ' handler must be an action function');
          }
        });

        publicMethods[methodName] = function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var state = _this.getInstance().getState();
          var value = spec.local && spec.local.apply(spec, [state].concat(args));
          var shouldFetch = spec.shouldFetch ? spec.shouldFetch.apply(spec, [state].concat(args))
          /*eslint-disable*/
          : value == null;
          /*eslint-enable*/
          var intercept = spec.interceptResponse || function (x) {
            return x;
          };

          var makeActionHandler = function () {
            function makeActionHandler(action, isError) {
              return function (x) {
                var fire = function () {
                  function fire() {
                    loadCounter -= 1;
                    action(intercept(x, action, args));
                    if (isError) throw x;
                    return x;
                  }

                  return fire;
                }();
                return _this.alt.trapAsync ? function () {
                  return fire();
                } : fire();
              };
            }

            return makeActionHandler;
          }();

          // if we don't have it in cache then fetch it
          if (shouldFetch) {
            loadCounter += 1;
            /* istanbul ignore else */
            if (spec.loading) spec.loading(intercept(null, spec.loading, args));
            return spec.remote.apply(spec, [state].concat(args)).then(makeActionHandler(spec.success), makeActionHandler(spec.error, 1));
          }

          // otherwise emit the change now
          _this.emitChange();
          return value;
        };

        return publicMethods;
      }, {});

      this.exportPublicMethods(toExport);
      this.exportPublicMethods({
        isLoading: function () {
          function isLoading() {
            return loadCounter > 0;
          }

          return isLoading;
        }()
      });
    }

    return registerAsync;
  }(),
  exportPublicMethods: function () {
    function exportPublicMethods(methods) {
      var _this2 = this;

      fn.eachObject(function (methodName, value) {
        if (!fn.isFunction(value)) {
          throw new TypeError('exportPublicMethods expects a function');
        }

        _this2.publicMethods[methodName] = value;
      }, [methods]);
    }

    return exportPublicMethods;
  }(),
  emitChange: function () {
    function emitChange() {
      this.getInstance().emitChange();
    }

    return emitChange;
  }(),
  on: function () {
    function on(lifecycleEvent, handler) {
      if (lifecycleEvent === 'error') this.handlesOwnErrors = true;
      var bus = this.lifecycleEvents[lifecycleEvent] || (0, _transmitter2['default'])();
      this.lifecycleEvents[lifecycleEvent] = bus;
      return bus.subscribe(handler.bind(this));
    }

    return on;
  }(),
  bindAction: function () {
    function bindAction(symbol, handler) {
      if (!symbol) {
        throw new ReferenceError('Invalid action reference passed in');
      }
      if (!fn.isFunction(handler)) {
        throw new TypeError('bindAction expects a function');
      }

      // You can pass in the constant or the function itself
      var key = symbol.id ? symbol.id : symbol;
      this.actionListeners[key] = this.actionListeners[key] || [];
      this.actionListeners[key].push(handler.bind(this));
      this.boundListeners.push(key);
    }

    return bindAction;
  }(),
  bindActions: function () {
    function bindActions(actions) {
      var _this3 = this;

      fn.eachObject(function (action, symbol) {
        var matchFirstCharacter = /./;
        var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
          return 'on' + String(x[0].toUpperCase());
        });

        if (_this3[action] && _this3[assumedEventHandler]) {
          // If you have both action and onAction
          throw new ReferenceError('You have multiple action handlers bound to an action: ' + (String(action) + ' and ' + String(assumedEventHandler)));
        }

        var handler = _this3[action] || _this3[assumedEventHandler];
        if (handler) {
          _this3.bindAction(symbol, handler);
        }
      }, [actions]);
    }

    return bindActions;
  }(),
  bindListeners: function () {
    function bindListeners(obj) {
      var _this4 = this;

      fn.eachObject(function (methodName, symbol) {
        var listener = _this4[methodName];

        if (!listener) {
          throw new ReferenceError(String(methodName) + ' defined but does not exist in ' + String(_this4.displayName));
        }

        if (Array.isArray(symbol)) {
          symbol.forEach(function (action) {
            _this4.bindAction(action, listener);
          });
        } else {
          _this4.bindAction(symbol, listener);
        }
      }, [obj]);
    }

    return bindListeners;
  }()
};

exports['default'] = StoreMixin;
module.exports = exports['default'];
},{"../functions":2,"transmitter":67}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStoreConfig = createStoreConfig;
exports.transformStore = transformStore;
exports.createStoreFromObject = createStoreFromObject;
exports.createStoreFromClass = createStoreFromClass;

var _AltUtils = require('../utils/AltUtils');

var utils = _interopRequireWildcard(_AltUtils);

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

var _AltStore = require('./AltStore');

var _AltStore2 = _interopRequireDefault(_AltStore);

var _StoreMixin = require('./StoreMixin');

var _StoreMixin2 = _interopRequireDefault(_StoreMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function doSetState(store, storeInstance, state) {
  if (!state) {
    return;
  }

  var config = storeInstance.StoreModel.config;


  var nextState = fn.isFunction(state) ? state(storeInstance.state) : state;

  storeInstance.state = config.setState.call(store, storeInstance.state, nextState);

  if (!store.alt.dispatcher.isDispatching()) {
    store.emitChange();
  }
}

function createPrototype(proto, alt, key, extras) {
  return fn.assign(proto, _StoreMixin2['default'], {
    displayName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    preventDefault: function () {
      function preventDefault() {
        this.getInstance().preventDefault = true;
      }

      return preventDefault;
    }(),

    boundListeners: [],
    lifecycleEvents: {},
    actionListeners: {},
    publicMethods: {},
    handlesOwnErrors: false
  }, extras);
}

function createStoreConfig(globalConfig, StoreModel) {
  StoreModel.config = fn.assign({
    getState: function () {
      function getState(state) {
        if (Array.isArray(state)) {
          return state.slice();
        } else if (fn.isMutableObject(state)) {
          return fn.assign({}, state);
        }

        return state;
      }

      return getState;
    }(),
    setState: function () {
      function setState(currentState, nextState) {
        if (fn.isMutableObject(nextState)) {
          return fn.assign(currentState, nextState);
        }
        return nextState;
      }

      return setState;
    }()
  }, globalConfig, StoreModel.config);
}

function transformStore(transforms, StoreModel) {
  return transforms.reduce(function (Store, transform) {
    return transform(Store);
  }, StoreModel);
}

function createStoreFromObject(alt, StoreModel, key) {
  var storeInstance = void 0;

  var StoreProto = createPrototype({}, alt, key, fn.assign({
    getInstance: function () {
      function getInstance() {
        return storeInstance;
      }

      return getInstance;
    }(),
    setState: function () {
      function setState(nextState) {
        doSetState(this, storeInstance, nextState);
      }

      return setState;
    }()
  }, StoreModel));

  // bind the store listeners
  /* istanbul ignore else */
  if (StoreProto.bindListeners) {
    _StoreMixin2['default'].bindListeners.call(StoreProto, StoreProto.bindListeners);
  }
  /* istanbul ignore else */
  if (StoreProto.observe) {
    _StoreMixin2['default'].bindListeners.call(StoreProto, StoreProto.observe(alt));
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    fn.eachObject(function (eventName, event) {
      _StoreMixin2['default'].on.call(StoreProto, eventName, event);
    }, [StoreProto.lifecycle]);
  }

  // create the instance and fn.assign the public methods to the instance
  storeInstance = fn.assign(new _AltStore2['default'](alt, StoreProto, StoreProto.state !== undefined ? StoreProto.state : {}, StoreModel), StoreProto.publicMethods, {
    displayName: key,
    config: StoreModel.config
  });

  return storeInstance;
}

function createStoreFromClass(alt, StoreModel, key) {
  var storeInstance = void 0;
  var config = StoreModel.config;

  // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.

  var Store = function (_StoreModel) {
    _inherits(Store, _StoreModel);

    function Store() {
      _classCallCheck(this, Store);

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _possibleConstructorReturn(this, _StoreModel.call.apply(_StoreModel, [this].concat(args)));
    }

    return Store;
  }(StoreModel);

  createPrototype(Store.prototype, alt, key, {
    type: 'AltStore',
    getInstance: function () {
      function getInstance() {
        return storeInstance;
      }

      return getInstance;
    }(),
    setState: function () {
      function setState(nextState) {
        doSetState(this, storeInstance, nextState);
      }

      return setState;
    }()
  });

  for (var _len = arguments.length, argsForClass = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    argsForClass[_key - 3] = arguments[_key];
  }

  var store = new (Function.prototype.bind.apply(Store, [null].concat(argsForClass)))();

  /* istanbul ignore next */
  if (config.bindListeners) store.bindListeners(config.bindListeners);
  /* istanbul ignore next */
  if (config.datasource) store.registerAsync(config.datasource);

  storeInstance = fn.assign(new _AltStore2['default'](alt, store, store.state !== undefined ? store.state : store, StoreModel), utils.getInternalMethods(StoreModel), config.publicMethods, { displayName: key });

  return storeInstance;
}
},{"../functions":2,"../utils/AltUtils":7,"./AltStore":4,"./StoreMixin":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getInternalMethods = getInternalMethods;
exports.getPrototypeChain = getPrototypeChain;
exports.warn = warn;
exports.uid = uid;
exports.formatAsConstant = formatAsConstant;
exports.dispatchIdentity = dispatchIdentity;
exports.fsa = fsa;
exports.dispatch = dispatch;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/*eslint-disable*/
var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);
/*eslint-enable*/

function getInternalMethods(Obj, isProto) {
  var excluded = isProto ? builtInProto : builtIns;
  var obj = isProto ? Obj.prototype : Obj;
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
}

function getPrototypeChain(Obj) {
  var methods = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return Obj === Function.prototype ? methods : getPrototypeChain(Object.getPrototypeOf(Obj), fn.assign(getInternalMethods(Obj, true), methods));
}

function warn(msg) {
  /* istanbul ignore else */
  /*eslint-disable*/
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg));
  }
  /*eslint-enable*/
}

function uid(container, name) {
  var count = 0;
  var key = name;
  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count);
  }
  return key;
}

function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return String(i[0]) + '_' + String(i[1].toLowerCase());
  }).toUpperCase();
}

function dispatchIdentity(x) {
  if (x === undefined) return null;

  for (var _len = arguments.length, a = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    a[_key - 1] = arguments[_key];
  }

  return a.length ? [x].concat(a) : x;
}

function fsa(id, type, payload, details) {
  return {
    type: type,
    payload: payload,
    meta: _extends({
      dispatchId: id
    }, details),

    id: id,
    action: type,
    data: payload,
    details: details
  };
}

function dispatch(id, actionObj, payload, alt) {
  var data = actionObj.dispatch(payload);
  if (data === undefined) return null;

  var type = actionObj.id;
  var namespace = type;
  var name = type;
  var details = { id: type, namespace: namespace, name: name };

  var dispatchLater = function dispatchLater(x) {
    return alt.dispatch(type, x, details);
  };

  if (fn.isFunction(data)) return data(dispatchLater, alt);

  // XXX standardize this
  return alt.dispatcher.dispatch(fsa(id, type, data, details));
}

/* istanbul ignore next */
function NoopClass() {}
},{"../functions":2}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAppState = setAppState;
exports.snapshot = snapshot;
exports.saveInitialSnapshot = saveInitialSnapshot;
exports.filterSnapshots = filterSnapshots;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function setAppState(instance, data, onStore) {
  var obj = instance.deserialize(data);
  fn.eachObject(function (key, value) {
    var store = instance.stores[key];
    if (store) {
      (function () {
        var config = store.StoreModel.config;

        var state = store.state;
        if (config.onDeserialize) obj[key] = config.onDeserialize(value) || value;
        if (fn.isMutableObject(state)) {
          fn.eachObject(function (k) {
            return delete state[k];
          }, [state]);
          fn.assign(state, obj[key]);
        } else {
          store.state = obj[key];
        }
        onStore(store, store.state);
      })();
    }
  }, [obj]);
}

function snapshot(instance) {
  var storeNames = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var stores = storeNames.length ? storeNames : Object.keys(instance.stores);
  return stores.reduce(function (obj, storeHandle) {
    var storeName = storeHandle.displayName || storeHandle;
    var store = instance.stores[storeName];
    var config = store.StoreModel.config;

    store.lifecycle('snapshot');
    var customSnapshot = config.onSerialize && config.onSerialize(store.state);
    obj[storeName] = customSnapshot ? customSnapshot : store.getState();
    return obj;
  }, {});
}

function saveInitialSnapshot(instance, key) {
  var state = instance.deserialize(instance.serialize(instance.stores[key].state));
  instance._initSnapshot[key] = state;
  instance._lastSnapshot[key] = state;
}

function filterSnapshots(instance, state, stores) {
  return stores.reduce(function (obj, store) {
    var storeName = store.displayName || store;
    if (!state[storeName]) {
      throw new ReferenceError(String(storeName) + ' is not a valid store');
    }
    obj[storeName] = state[storeName];
    return obj;
  }, {});
}
},{"../functions":2}],9:[function(require,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],10:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":11,"./lib/keys.js":12}],11:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],12:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],13:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))

},{"_process":35}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

module.exports = warning;
}).call(this,require('_process'))

},{"./emptyFunction":13,"_process":35}],16:[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher');

},{"./lib/Dispatcher":17}],17:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * 
 * @preventMunge
 */

'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = require('fbjs/lib/invariant');

var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
}).call(this,require('_process'))

},{"_process":35,"fbjs/lib/invariant":18}],18:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function (condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;
}).call(this,require('_process'))

},{"_process":35}],19:[function(require,module,exports){
/**
 * Indicates that navigation was caused by a call to history.push.
 */
'use strict';

exports.__esModule = true;
var PUSH = 'PUSH';

exports.PUSH = PUSH;
/**
 * Indicates that navigation was caused by a call to history.replace.
 */
var REPLACE = 'REPLACE';

exports.REPLACE = REPLACE;
/**
 * Indicates that navigation was caused by some other action such
 * as using a browser's back/forward buttons and/or manually manipulating
 * the URL in a browser's location bar. This is the default.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
 * for more information.
 */
var POP = 'POP';

exports.POP = POP;
exports['default'] = {
  PUSH: PUSH,
  REPLACE: REPLACE,
  POP: POP
};
},{}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.loopAsync = loopAsync;

function loopAsync(turns, work, callback) {
  var currentTurn = 0;
  var isDone = false;

  function done() {
    isDone = true;
    callback.apply(this, arguments);
  }

  function next() {
    if (isDone) return;

    if (currentTurn < turns) {
      work.call(this, currentTurn++, next, done);
    } else {
      done.apply(this, arguments);
    }
  }

  next();
}
},{}],21:[function(require,module,exports){
(function (process){
/*eslint-disable no-empty */
'use strict';

exports.__esModule = true;
exports.saveState = saveState;
exports.readState = readState;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var KeyPrefix = '@@History/';
var QuotaExceededError = 'QuotaExceededError';
var SecurityError = 'SecurityError';

function createKey(key) {
  return KeyPrefix + key;
}

function saveState(key, state) {
  try {
    window.sessionStorage.setItem(createKey(key), JSON.stringify(state));
  } catch (error) {
    if (error.name === SecurityError) {
      // Blocking cookies in Chrome/Firefox/Safari throws SecurityError on any
      // attempt to access window.sessionStorage.
      process.env.NODE_ENV !== 'production' ? _warning2['default'](false, '[history] Unable to save state; sessionStorage is not available due to security settings') : undefined;

      return;
    }

    if (error.name === QuotaExceededError && window.sessionStorage.length === 0) {
      // Safari "private mode" throws QuotaExceededError.
      process.env.NODE_ENV !== 'production' ? _warning2['default'](false, '[history] Unable to save state; sessionStorage is not available in Safari private mode') : undefined;

      return;
    }

    throw error;
  }
}

function readState(key) {
  var json = undefined;
  try {
    json = window.sessionStorage.getItem(createKey(key));
  } catch (error) {
    if (error.name === SecurityError) {
      // Blocking cookies in Chrome/Firefox/Safari throws SecurityError on any
      // attempt to access window.sessionStorage.
      process.env.NODE_ENV !== 'production' ? _warning2['default'](false, '[history] Unable to read state; sessionStorage is not available due to security settings') : undefined;

      return null;
    }
  }

  if (json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      // Ignore invalid JSON.
    }
  }

  return null;
}
}).call(this,require('_process'))

},{"_process":35,"warning":32}],22:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.getHashPath = getHashPath;
exports.replaceHashPath = replaceHashPath;
exports.getWindowPath = getWindowPath;
exports.go = go;
exports.getUserConfirmation = getUserConfirmation;
exports.supportsHistory = supportsHistory;
exports.supportsGoWithoutReloadUsingHash = supportsGoWithoutReloadUsingHash;

function addEventListener(node, event, listener) {
  if (node.addEventListener) {
    node.addEventListener(event, listener, false);
  } else {
    node.attachEvent('on' + event, listener);
  }
}

function removeEventListener(node, event, listener) {
  if (node.removeEventListener) {
    node.removeEventListener(event, listener, false);
  } else {
    node.detachEvent('on' + event, listener);
  }
}

function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  return window.location.href.split('#')[1] || '';
}

function replaceHashPath(path) {
  window.location.replace(window.location.pathname + window.location.search + '#' + path);
}

function getWindowPath() {
  return window.location.pathname + window.location.search + window.location.hash;
}

function go(n) {
  if (n) window.history.go(n);
}

function getUserConfirmation(message, callback) {
  callback(window.confirm(message));
}

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/rackt/react-router/issues/586
 */

function supportsHistory() {
  var ua = navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) {
    return false;
  }
  // FIXME: Work around our browser history not working correctly on Chrome
  // iOS: https://github.com/rackt/react-router/issues/2565
  if (ua.indexOf('CriOS') !== -1) {
    return false;
  }
  return window.history && 'pushState' in window.history;
}

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */

function supportsGoWithoutReloadUsingHash() {
  var ua = navigator.userAgent;
  return ua.indexOf('Firefox') === -1;
}
},{}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
exports.canUseDOM = canUseDOM;
},{}],24:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _Actions = require('./Actions');

var _ExecutionEnvironment = require('./ExecutionEnvironment');

var _DOMUtils = require('./DOMUtils');

var _DOMStateStorage = require('./DOMStateStorage');

var _createDOMHistory = require('./createDOMHistory');

var _createDOMHistory2 = _interopRequireDefault(_createDOMHistory);

var _parsePath = require('./parsePath');

var _parsePath2 = _interopRequireDefault(_parsePath);

/**
 * Creates and returns a history object that uses HTML5's history API
 * (pushState, replaceState, and the popstate event) to manage history.
 * This is the recommended method of managing history in browsers because
 * it provides the cleanest URLs.
 *
 * Note: In browsers that do not support the HTML5 history API full
 * page reloads will be used to preserve URLs.
 */
function createBrowserHistory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  !_ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? _invariant2['default'](false, 'Browser history needs a DOM') : _invariant2['default'](false) : undefined;

  var forceRefresh = options.forceRefresh;

  var isSupported = _DOMUtils.supportsHistory();
  var useRefresh = !isSupported || forceRefresh;

  function getCurrentLocation(historyState) {
    historyState = historyState || window.history.state || {};

    var path = _DOMUtils.getWindowPath();
    var _historyState = historyState;
    var key = _historyState.key;

    var state = undefined;
    if (key) {
      state = _DOMStateStorage.readState(key);
    } else {
      state = null;
      key = history.createKey();

      if (isSupported) window.history.replaceState(_extends({}, historyState, { key: key }), null, path);
    }

    var location = _parsePath2['default'](path);

    return history.createLocation(_extends({}, location, { state: state }), undefined, key);
  }

  function startPopStateListener(_ref) {
    var transitionTo = _ref.transitionTo;

    function popStateListener(event) {
      if (event.state === undefined) return; // Ignore extraneous popstate events in WebKit.

      transitionTo(getCurrentLocation(event.state));
    }

    _DOMUtils.addEventListener(window, 'popstate', popStateListener);

    return function () {
      _DOMUtils.removeEventListener(window, 'popstate', popStateListener);
    };
  }

  function finishTransition(location) {
    var basename = location.basename;
    var pathname = location.pathname;
    var search = location.search;
    var hash = location.hash;
    var state = location.state;
    var action = location.action;
    var key = location.key;

    if (action === _Actions.POP) return; // Nothing to do.

    _DOMStateStorage.saveState(key, state);

    var path = (basename || '') + pathname + search + hash;
    var historyState = {
      key: key
    };

    if (action === _Actions.PUSH) {
      if (useRefresh) {
        window.location.href = path;
        return false; // Prevent location update.
      } else {
          window.history.pushState(historyState, null, path);
        }
    } else {
      // REPLACE
      if (useRefresh) {
        window.location.replace(path);
        return false; // Prevent location update.
      } else {
          window.history.replaceState(historyState, null, path);
        }
    }
  }

  var history = _createDOMHistory2['default'](_extends({}, options, {
    getCurrentLocation: getCurrentLocation,
    finishTransition: finishTransition,
    saveState: _DOMStateStorage.saveState
  }));

  var listenerCount = 0,
      stopPopStateListener = undefined;

  function listenBefore(listener) {
    if (++listenerCount === 1) stopPopStateListener = startPopStateListener(history);

    var unlisten = history.listenBefore(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopPopStateListener();
    };
  }

  function listen(listener) {
    if (++listenerCount === 1) stopPopStateListener = startPopStateListener(history);

    var unlisten = history.listen(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopPopStateListener();
    };
  }

  // deprecated
  function registerTransitionHook(hook) {
    if (++listenerCount === 1) stopPopStateListener = startPopStateListener(history);

    history.registerTransitionHook(hook);
  }

  // deprecated
  function unregisterTransitionHook(hook) {
    history.unregisterTransitionHook(hook);

    if (--listenerCount === 0) stopPopStateListener();
  }

  return _extends({}, history, {
    listenBefore: listenBefore,
    listen: listen,
    registerTransitionHook: registerTransitionHook,
    unregisterTransitionHook: unregisterTransitionHook
  });
}

exports['default'] = createBrowserHistory;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"./Actions":19,"./DOMStateStorage":21,"./DOMUtils":22,"./ExecutionEnvironment":23,"./createDOMHistory":25,"./parsePath":30,"_process":35,"invariant":33}],25:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _ExecutionEnvironment = require('./ExecutionEnvironment');

var _DOMUtils = require('./DOMUtils');

var _createHistory = require('./createHistory');

var _createHistory2 = _interopRequireDefault(_createHistory);

function createDOMHistory(options) {
  var history = _createHistory2['default'](_extends({
    getUserConfirmation: _DOMUtils.getUserConfirmation
  }, options, {
    go: _DOMUtils.go
  }));

  function listen(listener) {
    !_ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? _invariant2['default'](false, 'DOM history needs a DOM') : _invariant2['default'](false) : undefined;

    return history.listen(listener);
  }

  return _extends({}, history, {
    listen: listen
  });
}

exports['default'] = createDOMHistory;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"./DOMUtils":22,"./ExecutionEnvironment":23,"./createHistory":26,"_process":35,"invariant":33}],26:[function(require,module,exports){
//import warning from 'warning'
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _AsyncUtils = require('./AsyncUtils');

var _Actions = require('./Actions');

var _createLocation2 = require('./createLocation');

var _createLocation3 = _interopRequireDefault(_createLocation2);

var _runTransitionHook = require('./runTransitionHook');

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _parsePath = require('./parsePath');

var _parsePath2 = _interopRequireDefault(_parsePath);

var _deprecate = require('./deprecate');

var _deprecate2 = _interopRequireDefault(_deprecate);

function createRandomKey(length) {
  return Math.random().toString(36).substr(2, length);
}

function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search &&
  //a.action === b.action && // Different action !== location change.
  a.key === b.key && _deepEqual2['default'](a.state, b.state);
}

var DefaultKeyLength = 6;

function createHistory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var getCurrentLocation = options.getCurrentLocation;
  var finishTransition = options.finishTransition;
  var saveState = options.saveState;
  var go = options.go;
  var keyLength = options.keyLength;
  var getUserConfirmation = options.getUserConfirmation;

  if (typeof keyLength !== 'number') keyLength = DefaultKeyLength;

  var transitionHooks = [];

  function listenBefore(hook) {
    transitionHooks.push(hook);

    return function () {
      transitionHooks = transitionHooks.filter(function (item) {
        return item !== hook;
      });
    };
  }

  var allKeys = [];
  var changeListeners = [];
  var location = undefined;

  function getCurrent() {
    if (pendingLocation && pendingLocation.action === _Actions.POP) {
      return allKeys.indexOf(pendingLocation.key);
    } else if (location) {
      return allKeys.indexOf(location.key);
    } else {
      return -1;
    }
  }

  function updateLocation(newLocation) {
    var current = getCurrent();

    location = newLocation;

    if (location.action === _Actions.PUSH) {
      allKeys = [].concat(allKeys.slice(0, current + 1), [location.key]);
    } else if (location.action === _Actions.REPLACE) {
      allKeys[current] = location.key;
    }

    changeListeners.forEach(function (listener) {
      listener(location);
    });
  }

  function listen(listener) {
    changeListeners.push(listener);

    if (location) {
      listener(location);
    } else {
      var _location = getCurrentLocation();
      allKeys = [_location.key];
      updateLocation(_location);
    }

    return function () {
      changeListeners = changeListeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function confirmTransitionTo(location, callback) {
    _AsyncUtils.loopAsync(transitionHooks.length, function (index, next, done) {
      _runTransitionHook2['default'](transitionHooks[index], location, function (result) {
        if (result != null) {
          done(result);
        } else {
          next();
        }
      });
    }, function (message) {
      if (getUserConfirmation && typeof message === 'string') {
        getUserConfirmation(message, function (ok) {
          callback(ok !== false);
        });
      } else {
        callback(message !== false);
      }
    });
  }

  var pendingLocation = undefined;

  function transitionTo(nextLocation) {
    if (location && locationsAreEqual(location, nextLocation)) return; // Nothing to do.

    pendingLocation = nextLocation;

    confirmTransitionTo(nextLocation, function (ok) {
      if (pendingLocation !== nextLocation) return; // Transition was interrupted.

      if (ok) {
        // treat PUSH to current path like REPLACE to be consistent with browsers
        if (nextLocation.action === _Actions.PUSH) {
          var prevPath = createPath(location);
          var nextPath = createPath(nextLocation);

          if (nextPath === prevPath) nextLocation.action = _Actions.REPLACE;
        }

        if (finishTransition(nextLocation) !== false) updateLocation(nextLocation);
      } else if (location && nextLocation.action === _Actions.POP) {
        var prevIndex = allKeys.indexOf(location.key);
        var nextIndex = allKeys.indexOf(nextLocation.key);

        if (prevIndex !== -1 && nextIndex !== -1) go(prevIndex - nextIndex); // Restore the URL.
      }
    });
  }

  function push(location) {
    transitionTo(createLocation(location, _Actions.PUSH, createKey()));
  }

  function replace(location) {
    transitionTo(createLocation(location, _Actions.REPLACE, createKey()));
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  function createKey() {
    return createRandomKey(keyLength);
  }

  function createPath(location) {
    if (location == null || typeof location === 'string') return location;

    var pathname = location.pathname;
    var search = location.search;
    var hash = location.hash;

    var result = pathname;

    if (search) result += search;

    if (hash) result += hash;

    return result;
  }

  function createHref(location) {
    return createPath(location);
  }

  function createLocation(location, action) {
    var key = arguments.length <= 2 || arguments[2] === undefined ? createKey() : arguments[2];

    if (typeof action === 'object') {
      //warning(
      //  false,
      //  'The state (2nd) argument to history.createLocation is deprecated; use a ' +
      //  'location descriptor instead'
      //)

      if (typeof location === 'string') location = _parsePath2['default'](location);

      location = _extends({}, location, { state: action });

      action = key;
      key = arguments[3] || createKey();
    }

    return _createLocation3['default'](location, action, key);
  }

  // deprecated
  function setState(state) {
    if (location) {
      updateLocationState(location, state);
      updateLocation(location);
    } else {
      updateLocationState(getCurrentLocation(), state);
    }
  }

  function updateLocationState(location, state) {
    location.state = _extends({}, location.state, state);
    saveState(location.key, location.state);
  }

  // deprecated
  function registerTransitionHook(hook) {
    if (transitionHooks.indexOf(hook) === -1) transitionHooks.push(hook);
  }

  // deprecated
  function unregisterTransitionHook(hook) {
    transitionHooks = transitionHooks.filter(function (item) {
      return item !== hook;
    });
  }

  // deprecated
  function pushState(state, path) {
    if (typeof path === 'string') path = _parsePath2['default'](path);

    push(_extends({ state: state }, path));
  }

  // deprecated
  function replaceState(state, path) {
    if (typeof path === 'string') path = _parsePath2['default'](path);

    replace(_extends({ state: state }, path));
  }

  return {
    listenBefore: listenBefore,
    listen: listen,
    transitionTo: transitionTo,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    createKey: createKey,
    createPath: createPath,
    createHref: createHref,
    createLocation: createLocation,

    setState: _deprecate2['default'](setState, 'setState is deprecated; use location.key to save state instead'),
    registerTransitionHook: _deprecate2['default'](registerTransitionHook, 'registerTransitionHook is deprecated; use listenBefore instead'),
    unregisterTransitionHook: _deprecate2['default'](unregisterTransitionHook, 'unregisterTransitionHook is deprecated; use the callback returned from listenBefore instead'),
    pushState: _deprecate2['default'](pushState, 'pushState is deprecated; use push instead'),
    replaceState: _deprecate2['default'](replaceState, 'replaceState is deprecated; use replace instead')
  };
}

exports['default'] = createHistory;
module.exports = exports['default'];
},{"./Actions":19,"./AsyncUtils":20,"./createLocation":27,"./deprecate":28,"./parsePath":30,"./runTransitionHook":31,"deep-equal":10}],27:[function(require,module,exports){
//import warning from 'warning'
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Actions = require('./Actions');

var _parsePath = require('./parsePath');

var _parsePath2 = _interopRequireDefault(_parsePath);

function createLocation() {
  var location = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? _Actions.POP : arguments[1];
  var key = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var _fourthArg = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

  if (typeof location === 'string') location = _parsePath2['default'](location);

  if (typeof action === 'object') {
    //warning(
    //  false,
    //  'The state (2nd) argument to createLocation is deprecated; use a ' +
    //  'location descriptor instead'
    //)

    location = _extends({}, location, { state: action });

    action = key || _Actions.POP;
    key = _fourthArg;
  }

  var pathname = location.pathname || '/';
  var search = location.search || '';
  var hash = location.hash || '';
  var state = location.state || null;

  return {
    pathname: pathname,
    search: search,
    hash: hash,
    state: state,
    action: action,
    key: key
  };
}

exports['default'] = createLocation;
module.exports = exports['default'];
},{"./Actions":19,"./parsePath":30}],28:[function(require,module,exports){
//import warning from 'warning'

"use strict";

exports.__esModule = true;
function deprecate(fn) {
  return fn;
  //return function () {
  //  warning(false, '[history] ' + message)
  //  return fn.apply(this, arguments)
  //}
}

exports["default"] = deprecate;
module.exports = exports["default"];
},{}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;
function extractPath(string) {
  var match = string.match(/^https?:\/\/[^\/]*/);

  if (match == null) return string;

  return string.substring(match[0].length);
}

exports["default"] = extractPath;
module.exports = exports["default"];
},{}],30:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _extractPath = require('./extractPath');

var _extractPath2 = _interopRequireDefault(_extractPath);

function parsePath(path) {
  var pathname = _extractPath2['default'](path);
  var search = '';
  var hash = '';

  process.env.NODE_ENV !== 'production' ? _warning2['default'](path === pathname, 'A path must be pathname + search + hash only, not a fully qualified URL like "%s"', path) : undefined;

  var hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substring(hashIndex);
    pathname = pathname.substring(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substring(searchIndex);
    pathname = pathname.substring(0, searchIndex);
  }

  if (pathname === '') pathname = '/';

  return {
    pathname: pathname,
    search: search,
    hash: hash
  };
}

exports['default'] = parsePath;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"./extractPath":29,"_process":35,"warning":32}],31:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function runTransitionHook(hook, location, callback) {
  var result = hook(location, callback);

  if (hook.length < 2) {
    // Assume the hook runs synchronously and automatically
    // call the callback with the return value.
    callback(result);
  } else {
    process.env.NODE_ENV !== 'production' ? _warning2['default'](result === undefined, 'You should not "return" in a transition hook with a callback argument; call the callback instead') : undefined;
  }
}

exports['default'] = runTransitionHook;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"_process":35,"warning":32}],32:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (process.env.NODE_ENV !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))

},{"_process":35}],33:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))

},{"_process":35}],34:[function(require,module,exports){
module.exports = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

},{}],35:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],36:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))

},{"./lib/ReactPropTypesSecret":40,"_process":35,"fbjs/lib/invariant":14,"fbjs/lib/warning":15}],37:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./lib/ReactPropTypesSecret":40,"fbjs/lib/emptyFunction":13,"fbjs/lib/invariant":14}],38:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

}).call(this,require('_process'))

},{"./checkPropTypes":36,"./lib/ReactPropTypesSecret":40,"_process":35,"fbjs/lib/emptyFunction":13,"fbjs/lib/invariant":14,"fbjs/lib/warning":15}],39:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

}).call(this,require('_process'))

},{"./factoryWithThrowingShims":37,"./factoryWithTypeCheckers":38,"_process":35}],40:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],41:[function(require,module,exports){
(function (process){
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var React = require('react');

var REACT_ELEMENT_TYPE =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) ||
  0xeac7;

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var SEPARATOR = '.';
var SUBSEPARATOR = ':';

var didWarnAboutMaps = false;

var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

function getIteratorFn(maybeIterable) {
  var iteratorFn =
    maybeIterable &&
    ((ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL]) ||
      maybeIterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

function escape(key) {
  var escapeRegex = /[=:]/g;
  var escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  var escapedString = ('' + key).replace(escapeRegex, function(match) {
    return escaperLookup[match];
  });

  return '$' + escapedString;
}

function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (component && typeof component === 'object' && component.key != null) {
    // Explicit key
    return escape(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

function traverseAllChildrenImpl(
  children,
  nameSoFar,
  callback,
  traverseContext
) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  if (
    children === null ||
    type === 'string' ||
    type === 'number' ||
    // The following is inlined from ReactElement. This means we can optimize
    // some checks. React Fiber also inlines this logic for similar purposes.
    (type === 'object' && children.$$typeof === REACT_ELEMENT_TYPE)
  ) {
    callback(
      traverseContext,
      children,
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar
    );
    return 1;
  }

  var child;
  var nextName;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        callback,
        traverseContext
      );
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (iteratorFn) {
      if (process.env.NODE_ENV !== 'production') {
        // Warn about using Maps as children
        if (iteratorFn === children.entries) {
          warning(
            didWarnAboutMaps,
            'Using Maps as children is unsupported and will likely yield ' +
              'unexpected results. Convert it to a sequence/iterable of keyed ' +
              'ReactElements instead.'
          );
          didWarnAboutMaps = true;
        }
      }

      var iterator = iteratorFn.call(children);
      var step;
      var ii = 0;
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getComponentKey(child, ii++);
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          callback,
          traverseContext
        );
      }
    } else if (type === 'object') {
      var addendum = '';
      if (process.env.NODE_ENV !== 'production') {
        addendum =
          ' If you meant to render a collection of children, use an array ' +
          'instead or wrap the object using createFragment(object) from the ' +
          'React add-ons.';
      }
      var childrenString = '' + children;
      invariant(
        false,
        'Objects are not valid as a React child (found: %s).%s',
        childrenString === '[object Object]'
          ? 'object with keys {' + Object.keys(children).join(', ') + '}'
          : childrenString,
        addendum
      );
    }
  }

  return subtreeCount;
}

function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}

var userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
  return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
}

function cloneAndReplaceKey(oldElement, newKey) {
  return React.cloneElement(
    oldElement,
    {key: newKey},
    oldElement.props !== undefined ? oldElement.props.children : undefined
  );
}

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = oneArgumentPooler;

var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var addPoolingTo = function addPoolingTo(CopyConstructor, pooler) {
  // Casting as any so that flow ignores the actual implementation and trusts
  // it to match the type we declared
  var NewKlass = CopyConstructor;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var standardReleaser = function standardReleaser(instance) {
  var Klass = this;
  invariant(
    instance instanceof Klass,
    'Trying to release an instance into a pool of a different type.'
  );
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var fourArgumentPooler = function fourArgumentPooler(a1, a2, a3, a4) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, a1, a2, a3, a4);
    return instance;
  } else {
    return new Klass(a1, a2, a3, a4);
  }
};

function MapBookKeeping(mapResult, keyPrefix, mapFunction, mapContext) {
  this.result = mapResult;
  this.keyPrefix = keyPrefix;
  this.func = mapFunction;
  this.context = mapContext;
  this.count = 0;
}
MapBookKeeping.prototype.destructor = function() {
  this.result = null;
  this.keyPrefix = null;
  this.func = null;
  this.context = null;
  this.count = 0;
};
addPoolingTo(MapBookKeeping, fourArgumentPooler);

function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  var result = bookKeeping.result;
  var keyPrefix = bookKeeping.keyPrefix;
  var func = bookKeeping.func;
  var context = bookKeeping.context;

  var mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(
      mappedChild,
      result,
      childKey,
      emptyFunction.thatReturnsArgument
    );
  } else if (mappedChild != null) {
    if (React.isValidElement(mappedChild)) {
      mappedChild = cloneAndReplaceKey(
        mappedChild,
        // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        keyPrefix +
          (mappedChild.key && (!child || child.key !== mappedChild.key)
            ? escapeUserProvidedKey(mappedChild.key) + '/'
            : '') +
          childKey
      );
    }
    result.push(mappedChild);
  }
}

function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  var escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  var traverseContext = MapBookKeeping.getPooled(
    array,
    escapedPrefix,
    func,
    context
  );
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  MapBookKeeping.release(traverseContext);
}

var numericPropertyRegex = /^\d+$/;

var warnedAboutNumeric = false;

function createReactFragment(object) {
  if (typeof object !== 'object' || !object || Array.isArray(object)) {
    warning(
      false,
      'React.addons.createFragment only accepts a single object. Got: %s',
      object
    );
    return object;
  }
  if (React.isValidElement(object)) {
    warning(
      false,
      'React.addons.createFragment does not accept a ReactElement ' +
        'without a wrapper object.'
    );
    return object;
  }

  invariant(
    object.nodeType !== 1,
    'React.addons.createFragment(...): Encountered an invalid child; DOM ' +
      'elements are not valid children of React components.'
  );

  var result = [];

  for (var key in object) {
    if (process.env.NODE_ENV !== 'production') {
      if (!warnedAboutNumeric && numericPropertyRegex.test(key)) {
        warning(
          false,
          'React.addons.createFragment(...): Child objects should have ' +
            'non-numeric keys so ordering is preserved.'
        );
        warnedAboutNumeric = true;
      }
    }
    mapIntoWithKeyPrefixInternal(
      object[key],
      result,
      key,
      emptyFunction.thatReturnsArgument
    );
  }

  return result;
}

module.exports = createReactFragment;

}).call(this,require('_process'))

},{"_process":35,"fbjs/lib/emptyFunction":13,"fbjs/lib/invariant":14,"fbjs/lib/warning":15,"react":"react"}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BreakView = function BreakView(props) {
  var label = props.breakLabel;
  var className = props.breakClassName || 'break';

  return _react2.default.createElement(
    'li',
    { className: className },
    label
  );
};

exports.default = BreakView;

},{"react":"react"}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PageView = function PageView(props) {
  var cssClassName = props.pageClassName;
  var linkClassName = props.pageLinkClassName;
  var onClick = props.onClick;
  var href = props.href;
  var ariaLabel = 'Page ' + props.page + (props.extraAriaContext ? ' ' + props.extraAriaContext : '');
  var ariaCurrent = null;

  if (props.selected) {
    ariaCurrent = 'page';
    ariaLabel = 'Page ' + props.page + ' is your current page';
    if (typeof cssClassName !== 'undefined') {
      cssClassName = cssClassName + ' ' + props.activeClassName;
    } else {
      cssClassName = props.activeClassName;
    }
  }

  return _react2.default.createElement(
    'li',
    { className: cssClassName },
    _react2.default.createElement(
      'a',
      { onClick: onClick,
        className: linkClassName,
        href: href,
        tabIndex: '0',
        'aria-label': ariaLabel,
        'aria-current': ariaCurrent,
        onKeyPress: onClick },
      props.page
    )
  );
};

exports.default = PageView;

},{"react":"react"}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactAddonsCreateFragment = require('react-addons-create-fragment');

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

var _PageView = require('./PageView');

var _PageView2 = _interopRequireDefault(_PageView);

var _BreakView = require('./BreakView');

var _BreakView2 = _interopRequireDefault(_BreakView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PaginationBoxView = function (_Component) {
  _inherits(PaginationBoxView, _Component);

  function PaginationBoxView(props) {
    _classCallCheck(this, PaginationBoxView);

    var _this = _possibleConstructorReturn(this, (PaginationBoxView.__proto__ || Object.getPrototypeOf(PaginationBoxView)).call(this, props));

    _this.handlePreviousPage = function (evt) {
      evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
      if (_this.state.selected > 0) {
        _this.handlePageSelected(_this.state.selected - 1, evt);
      }
    };

    _this.handleNextPage = function (evt) {
      evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
      if (_this.state.selected < _this.props.pageCount - 1) {
        _this.handlePageSelected(_this.state.selected + 1, evt);
      }
    };

    _this.handlePageSelected = function (selected, evt) {
      evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;

      if (_this.state.selected === selected) return;

      _this.setState({ selected: selected });

      // Call the callback with the new selected item:
      _this.callCallback(selected);
    };

    _this.callCallback = function (selectedItem) {
      if (typeof _this.props.onPageChange !== "undefined" && typeof _this.props.onPageChange === "function") {
        _this.props.onPageChange({ selected: selectedItem });
      }
    };

    _this.pagination = function () {
      var items = {};

      if (_this.props.pageCount <= _this.props.pageRangeDisplayed) {

        for (var index = 0; index < _this.props.pageCount; index++) {
          items['key' + index] = _this.getPageElement(index);
        }
      } else {

        var leftSide = _this.props.pageRangeDisplayed / 2;
        var rightSide = _this.props.pageRangeDisplayed - leftSide;

        if (_this.state.selected > _this.props.pageCount - _this.props.pageRangeDisplayed / 2) {
          rightSide = _this.props.pageCount - _this.state.selected;
          leftSide = _this.props.pageRangeDisplayed - rightSide;
        } else if (_this.state.selected < _this.props.pageRangeDisplayed / 2) {
          leftSide = _this.state.selected;
          rightSide = _this.props.pageRangeDisplayed - leftSide;
        }

        var _index = void 0;
        var page = void 0;
        var breakView = void 0;
        var createPageView = function createPageView(index) {
          return _this.getPageElement(index);
        };

        for (_index = 0; _index < _this.props.pageCount; _index++) {

          page = _index + 1;

          if (page <= _this.props.marginPagesDisplayed) {
            items['key' + _index] = createPageView(_index);
            continue;
          }

          if (page > _this.props.pageCount - _this.props.marginPagesDisplayed) {
            items['key' + _index] = createPageView(_index);
            continue;
          }

          if (_index >= _this.state.selected - leftSide && _index <= _this.state.selected + rightSide) {
            items['key' + _index] = createPageView(_index);
            continue;
          }

          var keys = Object.keys(items);
          var breakLabelKey = keys[keys.length - 1];
          var breakLabelValue = items[breakLabelKey];

          if (_this.props.breakLabel && breakLabelValue !== breakView) {
            breakView = _react2.default.createElement(_BreakView2.default, {
              breakLabel: _this.props.breakLabel,
              breakClassName: _this.props.breakClassName
            });

            items['key' + _index] = breakView;
          }
        }
      }

      return items;
    };

    _this.state = {
      selected: props.initialPage ? props.initialPage : props.forcePage ? props.forcePage : 0
    };
    return _this;
  }

  _createClass(PaginationBoxView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Call the callback with the initialPage item:
      if (typeof this.props.initialPage !== 'undefined' && !this.props.disableInitialCallback) {
        this.callCallback(this.props.initialPage);
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (typeof nextProps.forcePage !== 'undefined' && this.props.forcePage !== nextProps.forcePage) {
        this.setState({ selected: nextProps.forcePage });
      }
    }
  }, {
    key: 'hrefBuilder',
    value: function hrefBuilder(pageIndex) {
      if (this.props.hrefBuilder && pageIndex !== this.state.selected && pageIndex >= 0 && pageIndex < this.props.pageCount) {
        return this.props.hrefBuilder(pageIndex + 1);
      }
    }
  }, {
    key: 'getPageElement',
    value: function getPageElement(index) {
      return _react2.default.createElement(_PageView2.default, {
        onClick: this.handlePageSelected.bind(null, index),
        selected: this.state.selected === index,
        pageClassName: this.props.pageClassName,
        pageLinkClassName: this.props.pageLinkClassName,
        activeClassName: this.props.activeClassName,
        extraAriaContext: this.props.extraAriaContext,
        href: this.hrefBuilder(index),
        page: index + 1 });
    }
  }, {
    key: 'render',
    value: function render() {
      var disabled = this.props.disabledClassName;

      var previousClasses = (0, _classnames2.default)(this.props.previousClassName, _defineProperty({}, disabled, this.state.selected === 0));

      var nextClasses = (0, _classnames2.default)(this.props.nextClassName, _defineProperty({}, disabled, this.state.selected === this.props.pageCount - 1));

      return _react2.default.createElement(
        'ul',
        { className: this.props.containerClassName },
        _react2.default.createElement(
          'li',
          { className: previousClasses },
          _react2.default.createElement(
            'a',
            { onClick: this.handlePreviousPage,
              className: this.props.previousLinkClassName,
              href: this.hrefBuilder(this.state.selected - 1),
              tabIndex: '0',
              onKeyPress: this.handlePreviousPage },
            this.props.previousLabel
          )
        ),
        (0, _reactAddonsCreateFragment2.default)(this.pagination()),
        _react2.default.createElement(
          'li',
          { className: nextClasses },
          _react2.default.createElement(
            'a',
            { onClick: this.handleNextPage,
              className: this.props.nextLinkClassName,
              href: this.hrefBuilder(this.state.selected + 1),
              tabIndex: '0',
              onKeyPress: this.handleNextPage },
            this.props.nextLabel
          )
        )
      );
    }
  }]);

  return PaginationBoxView;
}(_react.Component);

PaginationBoxView.propTypes = {
  pageCount: _propTypes2.default.number.isRequired,
  pageRangeDisplayed: _propTypes2.default.number.isRequired,
  marginPagesDisplayed: _propTypes2.default.number.isRequired,
  previousLabel: _propTypes2.default.node,
  nextLabel: _propTypes2.default.node,
  breakLabel: _propTypes2.default.node,
  hrefBuilder: _propTypes2.default.func,
  onPageChange: _propTypes2.default.func,
  initialPage: _propTypes2.default.number,
  forcePage: _propTypes2.default.number,
  disableInitialCallback: _propTypes2.default.bool,
  containerClassName: _propTypes2.default.string,
  pageClassName: _propTypes2.default.string,
  pageLinkClassName: _propTypes2.default.string,
  activeClassName: _propTypes2.default.string,
  previousClassName: _propTypes2.default.string,
  nextClassName: _propTypes2.default.string,
  previousLinkClassName: _propTypes2.default.string,
  nextLinkClassName: _propTypes2.default.string,
  disabledClassName: _propTypes2.default.string,
  breakClassName: _propTypes2.default.string
};
PaginationBoxView.defaultProps = {
  pageCount: 10,
  pageRangeDisplayed: 2,
  marginPagesDisplayed: 3,
  activeClassName: "selected",
  previousClassName: "previous",
  nextClassName: "next",
  previousLabel: "Previous",
  nextLabel: "Next",
  breakLabel: "...",
  disabledClassName: "disabled",
  disableInitialCallback: false
};
exports.default = PaginationBoxView;
;

},{"./BreakView":42,"./PageView":43,"classnames":9,"prop-types":39,"react":"react","react-addons-create-fragment":41}],45:[function(require,module,exports){
'use strict';

var _PaginationBoxView = require('./PaginationBoxView');

var _PaginationBoxView2 = _interopRequireDefault(_PaginationBoxView);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _PaginationBoxView2.default;

},{"./PaginationBoxView":44}],46:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createBrowserHistory = require('history/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The public API for a <Router> that uses HTML5 history.
 */
var BrowserRouter = function (_React$Component) {
  _inherits(BrowserRouter, _React$Component);

  function BrowserRouter() {
    var _temp, _this, _ret;

    _classCallCheck(this, BrowserRouter);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.history = (0, _createBrowserHistory2.default)(_this.props), _temp), _possibleConstructorReturn(_this, _ret);
  }

  BrowserRouter.prototype.render = function render() {
    return _react2.default.createElement(_reactRouter.Router, { history: this.history, children: this.props.children });
  };

  return BrowserRouter;
}(_react2.default.Component);

BrowserRouter.propTypes = {
  basename: _propTypes2.default.string,
  forceRefresh: _propTypes2.default.bool,
  getUserConfirmation: _propTypes2.default.func,
  keyLength: _propTypes2.default.number,
  children: _propTypes2.default.node
};
exports.default = BrowserRouter;
},{"history/createBrowserHistory":62,"prop-types":39,"react":"react","react-router":"react-router"}],47:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createHashHistory = require('history/createHashHistory');

var _createHashHistory2 = _interopRequireDefault(_createHashHistory);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The public API for a <Router> that uses window.location.hash.
 */
var HashRouter = function (_React$Component) {
  _inherits(HashRouter, _React$Component);

  function HashRouter() {
    var _temp, _this, _ret;

    _classCallCheck(this, HashRouter);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.history = (0, _createHashHistory2.default)(_this.props), _temp), _possibleConstructorReturn(_this, _ret);
  }

  HashRouter.prototype.render = function render() {
    return _react2.default.createElement(_reactRouter.Router, { history: this.history, children: this.props.children });
  };

  return HashRouter;
}(_react2.default.Component);

HashRouter.propTypes = {
  basename: _propTypes2.default.string,
  getUserConfirmation: _propTypes2.default.func,
  hashType: _propTypes2.default.oneOf(['hashbang', 'noslash', 'slash']),
  children: _propTypes2.default.node
};
exports.default = HashRouter;
},{"history/createHashHistory":63,"prop-types":39,"react":"react","react-router":"react-router"}],48:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isModifiedEvent = function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
};

/**
 * The public API for rendering a history-aware <a>.
 */

var Link = function (_React$Component) {
  _inherits(Link, _React$Component);

  function Link() {
    var _temp, _this, _ret;

    _classCallCheck(this, Link);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleClick = function (event) {
      if (_this.props.onClick) _this.props.onClick(event);

      if (!event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore right clicks
      !_this.props.target && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
      ) {
          event.preventDefault();

          var history = _this.context.router.history;
          var _this$props = _this.props,
              replace = _this$props.replace,
              to = _this$props.to;


          if (replace) {
            history.replace(to);
          } else {
            history.push(to);
          }
        }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Link.prototype.render = function render() {
    var _props = this.props,
        replace = _props.replace,
        to = _props.to,
        props = _objectWithoutProperties(_props, ['replace', 'to']); // eslint-disable-line no-unused-vars

    var href = this.context.router.history.createHref(typeof to === 'string' ? { pathname: to } : to);

    return _react2.default.createElement('a', _extends({}, props, { onClick: this.handleClick, href: href }));
  };

  return Link;
}(_react2.default.Component);

Link.propTypes = {
  onClick: _propTypes2.default.func,
  target: _propTypes2.default.string,
  replace: _propTypes2.default.bool,
  to: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]).isRequired
};
Link.defaultProps = {
  replace: false
};
Link.contextTypes = {
  router: _propTypes2.default.shape({
    history: _propTypes2.default.shape({
      push: _propTypes2.default.func.isRequired,
      replace: _propTypes2.default.func.isRequired,
      createHref: _propTypes2.default.func.isRequired
    }).isRequired
  }).isRequired
};
exports.default = Link;
},{"prop-types":39,"react":"react"}],49:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.MemoryRouter;
  }
});
},{"react-router":"react-router"}],50:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

var _Link = require('./Link');

var _Link2 = _interopRequireDefault(_Link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
var NavLink = function NavLink(_ref) {
  var to = _ref.to,
      exact = _ref.exact,
      strict = _ref.strict,
      location = _ref.location,
      activeClassName = _ref.activeClassName,
      className = _ref.className,
      activeStyle = _ref.activeStyle,
      style = _ref.style,
      getIsActive = _ref.isActive,
      rest = _objectWithoutProperties(_ref, ['to', 'exact', 'strict', 'location', 'activeClassName', 'className', 'activeStyle', 'style', 'isActive']);

  return _react2.default.createElement(_reactRouter.Route, {
    path: (typeof to === 'undefined' ? 'undefined' : _typeof(to)) === 'object' ? to.pathname : to,
    exact: exact,
    strict: strict,
    location: location,
    children: function children(_ref2) {
      var location = _ref2.location,
          match = _ref2.match;

      var isActive = !!(getIsActive ? getIsActive(match, location) : match);

      return _react2.default.createElement(_Link2.default, _extends({
        to: to,
        className: isActive ? [activeClassName, className].filter(function (i) {
          return i;
        }).join(' ') : className,
        style: isActive ? _extends({}, style, activeStyle) : style
      }, rest));
    }
  });
};

NavLink.propTypes = {
  to: _Link2.default.propTypes.to,
  exact: _propTypes2.default.bool,
  strict: _propTypes2.default.bool,
  location: _propTypes2.default.object,
  activeClassName: _propTypes2.default.string,
  className: _propTypes2.default.string,
  activeStyle: _propTypes2.default.object,
  style: _propTypes2.default.object,
  isActive: _propTypes2.default.func
};

NavLink.defaultProps = {
  activeClassName: 'active'
};

exports.default = NavLink;
},{"./Link":48,"prop-types":39,"react":"react","react-router":"react-router"}],51:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.Prompt;
  }
});
},{"react-router":"react-router"}],52:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.Redirect;
  }
});
},{"react-router":"react-router"}],53:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.Route;
  }
});
},{"react-router":"react-router"}],54:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.Router;
  }
});
},{"react-router":"react-router"}],55:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.StaticRouter;
  }
});
},{"react-router":"react-router"}],56:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.Switch;
  }
});
},{"react-router":"react-router"}],57:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.withRouter = exports.matchPath = exports.Switch = exports.StaticRouter = exports.Router = exports.Route = exports.Redirect = exports.Prompt = exports.NavLink = exports.MemoryRouter = exports.Link = exports.HashRouter = exports.BrowserRouter = undefined;

var _BrowserRouter2 = require('./BrowserRouter');

var _BrowserRouter3 = _interopRequireDefault(_BrowserRouter2);

var _HashRouter2 = require('./HashRouter');

var _HashRouter3 = _interopRequireDefault(_HashRouter2);

var _Link2 = require('./Link');

var _Link3 = _interopRequireDefault(_Link2);

var _MemoryRouter2 = require('./MemoryRouter');

var _MemoryRouter3 = _interopRequireDefault(_MemoryRouter2);

var _NavLink2 = require('./NavLink');

var _NavLink3 = _interopRequireDefault(_NavLink2);

var _Prompt2 = require('./Prompt');

var _Prompt3 = _interopRequireDefault(_Prompt2);

var _Redirect2 = require('./Redirect');

var _Redirect3 = _interopRequireDefault(_Redirect2);

var _Route2 = require('./Route');

var _Route3 = _interopRequireDefault(_Route2);

var _Router2 = require('./Router');

var _Router3 = _interopRequireDefault(_Router2);

var _StaticRouter2 = require('./StaticRouter');

var _StaticRouter3 = _interopRequireDefault(_StaticRouter2);

var _Switch2 = require('./Switch');

var _Switch3 = _interopRequireDefault(_Switch2);

var _matchPath2 = require('./matchPath');

var _matchPath3 = _interopRequireDefault(_matchPath2);

var _withRouter2 = require('./withRouter');

var _withRouter3 = _interopRequireDefault(_withRouter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.BrowserRouter = _BrowserRouter3.default;
exports.HashRouter = _HashRouter3.default;
exports.Link = _Link3.default;
exports.MemoryRouter = _MemoryRouter3.default;
exports.NavLink = _NavLink3.default;
exports.Prompt = _Prompt3.default;
exports.Redirect = _Redirect3.default;
exports.Route = _Route3.default;
exports.Router = _Router3.default;
exports.StaticRouter = _StaticRouter3.default;
exports.Switch = _Switch3.default;
exports.matchPath = _matchPath3.default;
exports.withRouter = _withRouter3.default;
},{"./BrowserRouter":46,"./HashRouter":47,"./Link":48,"./MemoryRouter":49,"./NavLink":50,"./Prompt":51,"./Redirect":52,"./Route":53,"./Router":54,"./StaticRouter":55,"./Switch":56,"./matchPath":58,"./withRouter":65}],58:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.matchPath;
  }
});
},{"react-router":"react-router"}],59:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
};

var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
};

var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
  return callback(window.confirm(message));
}; // eslint-disable-line no-alert

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = window.navigator.userAgent;

  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

  return window.history && 'pushState' in window.history;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
};
},{}],60:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.locationsAreEqual = exports.createLocation = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _resolvePathname = require('resolve-pathname');

var _resolvePathname2 = _interopRequireDefault(_resolvePathname);

var _valueEqual = require('value-equal');

var _valueEqual2 = _interopRequireDefault(_valueEqual);

var _PathUtils = require('./PathUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
  var location = void 0;
  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = (0, _PathUtils.parsePath)(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);

    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
};

var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
};
},{"./PathUtils":61,"resolve-pathname":66,"value-equal":68}],61:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
};

var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
};

var hasBasename = exports.hasBasename = function hasBasename(path, prefix) {
  return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
};

var stripBasename = exports.stripBasename = function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
};

var stripTrailingSlash = exports.stripTrailingSlash = function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
};

var parsePath = exports.parsePath = function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';

  var hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
};

var createPath = exports.createPath = function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;


  var path = pathname || '/';

  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;

  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

  return path;
};
},{}],62:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = require('./LocationUtils');

var _PathUtils = require('./PathUtils');

var _createTransitionManager = require('./createTransitionManager');

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = require('./DOMUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

var getHistoryState = function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
};

/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function createBrowserHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Browser history needs a DOM');

  var globalHistory = window.history;
  var canUseHistory = (0, _DOMUtils.supportsHistory)();
  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();

  var _props$forceRefresh = props.forceRefresh,
      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
      _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$keyLength = props.keyLength,
      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var getDOMLocation = function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;


    var path = pathname + search + hash;

    (0, _warning2.default)(!basename || (0, _PathUtils.hasBasename)(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');

    if (basename) path = (0, _PathUtils.stripBasename)(path, basename);

    return (0, _LocationUtils.createLocation)(path, state, key);
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var handlePopState = function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;

    handlePop(getDOMLocation(event.state));
  };

  var handleHashChange = function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  };

  var forceNextPop = false;

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allKeys.indexOf(fromLocation.key);

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key];

  // Public interface

  var createHref = function createHref(location) {
    return basename + (0, _PathUtils.createPath)(location);
  };

  var push = function push(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.pushState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

          nextKeys.push(location.key);
          allKeys = nextKeys;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');

        window.location.href = href;
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.replaceState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);

          if (prevIndex !== -1) allKeys[prevIndex] = location.key;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');

        window.location.replace(href);
      }
    });
  };

  var go = function go(n) {
    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createBrowserHistory;
},{"./DOMUtils":59,"./LocationUtils":60,"./PathUtils":61,"./createTransitionManager":64,"invariant":33,"warning":69}],63:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = require('./LocationUtils');

var _PathUtils = require('./PathUtils');

var _createTransitionManager = require('./createTransitionManager');

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = require('./DOMUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HashChangeEvent = 'hashchange';

var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + (0, _PathUtils.stripLeadingSlash)(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: _PathUtils.stripLeadingSlash,
    decodePath: _PathUtils.addLeadingSlash
  },
  slash: {
    encodePath: _PathUtils.addLeadingSlash,
    decodePath: _PathUtils.addLeadingSlash
  }
};

var getHashPath = function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
};

var pushHashPath = function pushHashPath(path) {
  return window.location.hash = path;
};

var replaceHashPath = function replaceHashPath(path) {
  var hashIndex = window.location.href.indexOf('#');

  window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
};

var createHashHistory = function createHashHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Hash history needs a DOM');

  var globalHistory = window.history;
  var canGoWithoutReload = (0, _DOMUtils.supportsGoWithoutReloadUsingHash)();

  var _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$hashType = props.hashType,
      hashType = _props$hashType === undefined ? 'slash' : _props$hashType;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var _HashPathCoders$hashT = HashPathCoders[hashType],
      encodePath = _HashPathCoders$hashT.encodePath,
      decodePath = _HashPathCoders$hashT.decodePath;


  var getDOMLocation = function getDOMLocation() {
    var path = decodePath(getHashPath());

    (0, _warning2.default)(!basename || (0, _PathUtils.hasBasename)(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');

    if (basename) path = (0, _PathUtils.stripBasename)(path, basename);

    return (0, _LocationUtils.createLocation)(path);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var forceNextPop = false;
  var ignorePath = null;

  var handleHashChange = function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;

      if (!forceNextPop && (0, _LocationUtils.locationsAreEqual)(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === (0, _PathUtils.createPath)(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;

      handlePop(location);
    }
  };

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(toLocation));

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(fromLocation));

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  // Ensure the hash is encoded properly before doing anything else.
  var path = getHashPath();
  var encodedPath = encodePath(path);

  if (path !== encodedPath) replaceHashPath(encodedPath);

  var initialLocation = getDOMLocation();
  var allPaths = [(0, _PathUtils.createPath)(initialLocation)];

  // Public interface

  var createHref = function createHref(location) {
    return '#' + encodePath(basename + (0, _PathUtils.createPath)(location));
  };

  var push = function push(path, state) {
    (0, _warning2.default)(state === undefined, 'Hash history cannot push state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var path = (0, _PathUtils.createPath)(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);

        var prevIndex = allPaths.lastIndexOf((0, _PathUtils.createPath)(history.location));
        var nextPaths = allPaths.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

        nextPaths.push(path);
        allPaths = nextPaths;

        setState({ action: action, location: location });
      } else {
        (0, _warning2.default)(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');

        setState();
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(state === undefined, 'Hash history cannot replace state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, undefined, undefined, history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var path = (0, _PathUtils.createPath)(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf((0, _PathUtils.createPath)(history.location));

      if (prevIndex !== -1) allPaths[prevIndex] = path;

      setState({ action: action, location: location });
    });
  };

  var go = function go(n) {
    (0, _warning2.default)(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');

    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createHashHistory;
},{"./DOMUtils":59,"./LocationUtils":60,"./PathUtils":61,"./createTransitionManager":64,"invariant":33,"warning":69}],64:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createTransitionManager = function createTransitionManager() {
  var prompt = null;

  var setPrompt = function setPrompt(nextPrompt) {
    (0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time');

    prompt = nextPrompt;

    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          (0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message');

          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  };

  var listeners = [];

  var appendListener = function appendListener(fn) {
    var isActive = true;

    var listener = function listener() {
      if (isActive) fn.apply(undefined, arguments);
    };

    listeners.push(listener);

    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var notifyListeners = function notifyListeners() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(undefined, args);
    });
  };

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
};

exports.default = createTransitionManager;
},{"warning":69}],65:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _reactRouter = require('react-router');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _reactRouter.withRouter;
  }
});
},{"react-router":"react-router"}],66:[function(require,module,exports){
'use strict';

var isAbsolute = function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
};

// About 1.5x faster than the two-arg version of Array#splice()
var spliceOne = function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }list.pop();
};

// This implementation is based heavily on node's url.parse
var resolvePathname = function resolvePathname(to) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];

  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';

  var hasTrailingSlash = void 0;
  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;
  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) {
    fromParts.unshift('..');
  }if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');

  var result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result;
};

module.exports = resolvePathname;
},{}],67:[function(require,module,exports){
"use strict";

function transmitter() {
  var subscriptions = [];
  var nowDispatching = false;
  var toUnsubscribe = {};

  var unsubscribe = function unsubscribe(onChange) {
    var id = subscriptions.indexOf(onChange);
    if (id < 0) return;
    if (nowDispatching) {
      toUnsubscribe[id] = onChange;
      return;
    }
    subscriptions.splice(id, 1);
  };

  var subscribe = function subscribe(onChange) {
    var id = subscriptions.push(onChange);
    var dispose = function dispose() {
      return unsubscribe(onChange);
    };
    return { dispose: dispose };
  };

  var publish = function publish() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    nowDispatching = true;
    try {
      subscriptions.forEach(function (subscription, id) {
        return toUnsubscribe[id] || subscription.apply(undefined, args);
      });
    } finally {
      nowDispatching = false;
      Object.keys(toUnsubscribe).forEach(function (id) {
        return unsubscribe(toUnsubscribe[id]);
      });
      toUnsubscribe = {};
    }
  };

  return {
    publish: publish,
    subscribe: subscribe,
    $subscriptions: subscriptions
  };
}

module.exports = transmitter;
},{}],68:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var valueEqual = function valueEqual(a, b) {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
    return valueEqual(item, b[index]);
  });

  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);

  if (aType !== bType) return false;

  if (aType === 'object') {
    var aValue = a.valueOf();
    var bValue = b.valueOf();

    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(function (key) {
      return valueEqual(a[key], b[key]);
    });
  }

  return false;
};

exports.default = valueEqual;
},{}],69:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (process.env.NODE_ENV !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))

},{"_process":35}],70:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Auth = require('./components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataRequests = function () {
  function DataRequests() {
    _classCallCheck(this, DataRequests);
  }

  _createClass(DataRequests, null, [{
    key: 'post',
    value: function post(url, data, authenticated) {
      var headers = { 'Content-Type': 'application/json' };

      if (authenticated) {
        headers.Authorization = 'bearer ' + _Auth2.default.getToken();
      }

      return {
        url: url,
        method: 'POST',
        data: JSON.stringify(data),
        mode: 'cors',
        headers: headers
      };
    }
  }, {
    key: 'get',
    value: function get(url, authenticated) {
      var headers = { 'Content-Type': 'application/json' };

      if (authenticated) {
        headers.Authorization = 'bearer ' + _Auth2.default.getToken();
      }

      return {
        url: url,
        method: 'GET',
        mode: 'cors',
        headers: headers
      };
    }
  }]);

  return DataRequests;
}();

exports.default = DataRequests;

},{"./components/Auth":88}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdminPanelActions = function () {
  function AdminPanelActions() {
    _classCallCheck(this, AdminPanelActions);

    this.generateActions('handleContentChange', 'contentValidationFail', 'makeAdminSuccess', 'makeAdminFail', 'loadAdminPanelForm', 'getAdminsSuccess', 'getAdminsFail');
  }

  _createClass(AdminPanelActions, [{
    key: 'addPost',
    value: function addPost(data) {
      var _this = this;

      var request = _DataRequests2.default.post('/api/user/makeAdmin', data, true);
      $.ajax(request).done(function () {
        _this.makeAdminSuccess();
      }).fail(function (err) {
        return _this.makeAdminFail(err);
      });

      return true;
    }
  }, {
    key: 'getAdmins',
    value: function getAdmins() {
      var _this2 = this;

      var request = _DataRequests2.default.get('/user/getAdmins', true);

      $.ajax(request).done(function (data) {
        _this2.getAdminsSuccess(data);
      }).fail(function (err) {
        return _this2.getAdminsFail(err);
      });

      return true;
    }
  }]);

  return AdminPanelActions;
}();

exports.default = _alt2.default.createActions(AdminPanelActions);

},{"../DataRequests":70,"../alt":85}],72:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlockUserActions = function () {
    function BlockUserActions() {
        _classCallCheck(this, BlockUserActions);

        this.generateActions('handleContentChange', 'contentValidationFail', 'blockUserSuccess', 'blockUserFail', 'blockUserWhoIsBlockedError', 'userNotExist', 'blockYourProfileError', 'loadBlockUserForm');
    }

    _createClass(BlockUserActions, [{
        key: 'getUserForBlock',
        value: function getUserForBlock(data) {
            var _this = this;

            var request = {
                url: '/api/user/getByUsername/' + data.usernameForBlock,
                method: 'get',
                data: JSON.stringify(data),
                contentType: 'application/json'
            };

            var cureentUserId = data.currentUserID;

            $.ajax(request).done(function (data) {
                if (data.length <= 0) {
                    return true;
                }

                var dataForRequest = {
                    userForBlockId: data[0]._id,
                    currentUserId: cureentUserId
                };

                var request = {
                    url: '/api/user/block/',
                    method: 'post',
                    data: JSON.stringify(dataForRequest),
                    contentType: 'application/json'
                };

                if (userForBlockId !== cureentUserId) {
                    $.ajax(request).done(function () {
                        return _this.blockUserSuccess();
                    }).fail(function (err) {
                        _this.blockUserWhoIsBlockedError();
                    });
                } else {
                    _this.blockYourProfileError();
                }
            }).fail(function (err) {
                return _this.userNotExist();
            });

            return true;
        }
    }]);

    return BlockUserActions;
}();

exports.default = _alt2.default.createActions(BlockUserActions);

},{"../alt":85}],73:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FooterActions = function FooterActions() {
  _classCallCheck(this, FooterActions);

  this.generateActions();
};

exports.default = _alt2.default.createActions(FooterActions);

},{"../alt":85}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormActions = function FormActions() {
  _classCallCheck(this, FormActions);

  this.generateActions('handleUsernameChange', 'handlePasswordChange', 'handleConfirmedPasswordChange', 'handleFirstNameChange', 'handleLastNameChange', 'handleAgeChange', 'handleGenderChange', 'usernameValidationFail', 'passwordValidationFail', 'unauthorizedAccessAttempt');
};

exports.default = _alt2.default.createActions(FormActions);

},{"../alt":85}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HomeActions = function () {
  function HomeActions() {
    _classCallCheck(this, HomeActions);

    this.generateActions('getUserPostsSuccess', 'getUserPostsFail', 'removePostsSuccess', 'handlePageChange');
  }

  _createClass(HomeActions, [{
    key: 'getUserPosts',
    value: function getUserPosts() {
      var _this = this;

      var request = _DataRequests2.default.get('/api/posts/all', true);

      $.ajax(request).done(function (data) {
        return _this.getUserPostsSuccess(data);
      }).fail(function (err) {
        return _this.getUserPostsFail(err);
      });

      return true;
    }
  }]);

  return HomeActions;
}();

exports.default = _alt2.default.createActions(HomeActions);

},{"../DataRequests":70,"../alt":85}],76:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageActions = function () {
  function MessageActions() {
    _classCallCheck(this, MessageActions);

    this.generateActions('sendMessageSuccess', 'getThreadMessagesSuccess', 'getThreadMessagesFail');
  }

  _createClass(MessageActions, [{
    key: 'getThreadMessages',
    value: function getThreadMessages(otherUserUsername) {
      var _this = this;

      var req = _DataRequests2.default.get('/api/thread/' + otherUserUsername, true);
      $.ajax(req).done(function (thread) {
        return _this.getThreadMessagesSuccess(thread);
      }).fail(function () {
        return _this.getThreadMessagesFail();
      });

      return true;
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(content, threadId) {
      var _this2 = this;

      var req = _DataRequests2.default.post('/api/message/add/' + threadId, content, true);

      $.ajax(req).done(function (thread) {
        return _this2.sendMessageSuccess(thread);
      });

      return true;
    }
  }]);

  return MessageActions;
}();

exports.default = _alt2.default.createActions(MessageActions);

},{"../DataRequests":70,"../alt":85}],77:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavbarActions = function NavbarActions() {
  _classCallCheck(this, NavbarActions);

  this.generateActions('updateAjaxAnimation');
};

exports.default = _alt2.default.createActions(NavbarActions);

},{"../alt":85}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostDeleteActions = function () {
  function PostDeleteActions() {
    _classCallCheck(this, PostDeleteActions);

    this.generateActions('deletePostSuccess', 'deletePostFail', 'getDeletePostInfoFail', 'getDeletePostInfoSuccess');
  }

  _createClass(PostDeleteActions, [{
    key: 'getDeletePostInfo',
    value: function getDeletePostInfo(postId) {
      var _this = this;

      var request = _DataRequests2.default.get('/api/post/delete/' + postId, true);

      $.ajax(request).done(function (data) {
        _this.getDeletePostInfoSuccess(data);
      }).fail(function (err) {
        console.log(err);
        _this.getDeletePostInfoFail(err);
      });

      return true;
    }
  }, {
    key: 'deletePost',
    value: function deletePost(data) {
      var _this2 = this;

      var request = _DataRequests2.default.post('/api/post/delete/' + data.postId, data, true);

      $.ajax(request).done(function (data) {
        _this2.deletePostSuccess(data);
      }).fail(function (err) {
        console.log(err);
        _this2.deletePostFail(err);
      });

      return true;
    }
  }]);

  return PostDeleteActions;
}();

exports.default = _alt2.default.createActions(PostDeleteActions);

},{"../DataRequests":70,"../alt":85}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _Auth = require('../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProfilePictureAddActions = function () {
  function ProfilePictureAddActions() {
    _classCallCheck(this, ProfilePictureAddActions);

    this.generateActions('handleContentChange', 'contentValidationFail', 'addProfilePictureSuccess', 'addProfilePictureFail');
  }

  _createClass(ProfilePictureAddActions, [{
    key: 'addProfilePicture',
    value: function addProfilePicture(data) {
      var _this = this;

      var formData = new FormData();
      formData.append('image', data.image);
      var request = {
        url: '/api/user/profile-picture/' + data.userId,
        method: 'POST',
        data: formData,
        mode: 'cors',
        contentType: false,
        processData: false,
        dataType: 'json',
        headers: {
          'Authorization': 'bearer ' + _Auth2.default.getToken()
        }
      };
      $.ajax(request).done(function (data) {
        _this.addProfilePictureSuccess(data);
      }).fail(function (err) {
        console.log(err);
        _this.addProfilePictureFail(err);
      });

      return true;
    }
  }]);

  return ProfilePictureAddActions;
}();

exports.default = _alt2.default.createActions(ProfilePictureAddActions);

},{"../alt":85,"../components/Auth":88}],80:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchBarActions = function () {
    function SearchBarActions() {
        _classCallCheck(this, SearchBarActions);

        this.generateActions('handleContentChange', 'contentValidationFail', 'loadSearchBarForm');
    }

    _createClass(SearchBarActions, [{
        key: 'searchUsers',
        value: function searchUsers(data) {
            var request = _DataRequests2.default.post('/api/post/add', data, true);
            $.ajax(request).done(function () {
                //this.addPostSuccess()
            }).fail();

            return true;
        }
    }]);

    return SearchBarActions;
}();

exports.default = _alt2.default.createActions(SearchBarActions);

},{"../DataRequests":70,"../alt":85}],81:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

var _HomeActions = require('./HomeActions');

var _HomeActions2 = _interopRequireDefault(_HomeActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserActions = function () {
  function UserActions() {
    _classCallCheck(this, UserActions);

    this.generateActions('registerUserSuccess', 'registerUserFail', 'loginUserSuccess', 'loginUserFail', 'logoutUserSuccess', 'getUserOwnPostsSuccess', 'getUserOwnPostsFail', 'getProfileInfoSuccess', 'logoutUserSuccess', 'followUserSuccess', 'getUserThreadsSuccess', 'getUserThreadsFail');
  }

  _createClass(UserActions, [{
    key: 'getUserThreads',
    value: function getUserThreads(userId) {
      var _this = this;

      // let request = Data.get(`/api/threads`, true)
      var request = {
        url: '/api/threads',
        method: 'GET',
        contentType: 'application/json'
      };
      $.ajax(request).done(function (threads) {
        return _this.getUserThreadsSuccess(threads);
      }).fail(function () {
        return _this.getUserThreadsFail();
      });

      return true;
    }
  }, {
    key: 'getUserOwnPosts',
    value: function getUserOwnPosts(userId) {
      var _this2 = this;

      var req = _DataRequests2.default.get('/api/post/own/' + userId, true);

      $.ajax(req).done(function (posts) {
        return _this2.getUserOwnPostsSuccess(posts);
      }).fail(function () {
        return _this2.getUserOwnPostsFail();
      });

      return true;
    }
  }, {
    key: 'registerUser',
    value: function registerUser(data) {
      var _this3 = this;

      var request = {
        url: '/user/register',
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json'
      };

      $.ajax(request).done(function (data) {
        _this3.registerUserSuccess(data);
      }).fail(function (err) {
        console.log('Error', err);
        _this3.registerUserFail(err.responseJSON.message);
      });

      return true;
    }
  }, {
    key: 'loginUser',
    value: function loginUser(data) {
      var _this4 = this;

      var request = {
        url: '/user/login',
        method: 'post',
        data: JSON.stringify(data),
        contentType: 'application/json'
      };

      $.ajax(request).done(function (data) {
        _this4.loginUserSuccess(data);
      }).fail(function (err) {
        return _this4.loginUserFail(err.responseJSON);
      });

      return true;
    }
  }, {
    key: 'logoutUser',
    value: function logoutUser() {
      var _this5 = this;

      var request = {
        url: '/user/logout',
        method: 'post'
      };

      $.ajax(request).done(function () {
        _this5.logoutUserSuccess();
        _HomeActions2.default.removePostsSuccess();
      });

      return true;
    }
  }, {
    key: 'getUserInformation',
    value: function getUserInformation(userId) {
      var _this6 = this;

      var request = _DataRequests2.default.get('/api/user/' + userId, true);

      $.ajax(request).done(function (userInfo) {
        return _this6.getProfileInfoSuccess(userInfo);
      });

      return true;
    }
  }]);

  return UserActions;
}();

exports.default = _alt2.default.createActions(UserActions);

},{"../DataRequests":70,"../alt":85,"./HomeActions":75}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostAddActions = function () {
  function PostAddActions() {
    _classCallCheck(this, PostAddActions);

    this.generateActions('handleContentChange', 'contentValidationFail', 'addPostSuccess', 'addPostFail', 'loadPostAddForm');
  }

  _createClass(PostAddActions, [{
    key: 'addPost',
    value: function addPost(data) {
      var _this = this;

      var request = _DataRequests2.default.post('/api/post/add', data, true);
      $.ajax(request).done(function () {
        _this.addPostSuccess();
      }).fail(function (err) {
        return _this.addPostFail(err);
      });

      return true;
    }
  }]);

  return PostAddActions;
}();

exports.default = _alt2.default.createActions(PostAddActions);

},{"../../DataRequests":70,"../../alt":85}],83:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostCommentActions = function () {
  function PostCommentActions() {
    _classCallCheck(this, PostCommentActions);

    this.generateActions('addCommentSuccess', 'commentValidationFail', 'handleCommentChange', 'getPostInfoSuccess', 'getCommentInfoSuccess', 'getCommentInfoFail', 'handleEditCommentChange', 'editCommentValidationFail', 'editCommentSuccess', 'editCommentFail', 'deleteCommentSuccess', 'deleteCommentFail', 'clearRedirectSuccess');
  }

  _createClass(PostCommentActions, [{
    key: 'addComment',
    value: function addComment(postId, comment) {
      var _this = this;

      var request = _DataRequests2.default.post('/api/post/comments/' + postId, { comment: comment }, true);

      $.ajax(request).done(function () {
        _this.addCommentSuccess();
        _this.getPostInfo(postId);
      }).fail(function () {
        return console.log('Could\'t add comment');
      });

      return true;
    }
  }, {
    key: 'getPostInfo',
    value: function getPostInfo(postId) {
      var _this2 = this;

      var request = _DataRequests2.default.get('/api/post/' + postId, true);

      $.ajax(request).done(function (post) {
        return _this2.getPostInfoSuccess(post);
      }).fail(function () {
        return console.log('Could\'t get post info');
      });

      return true;
    }
  }, {
    key: 'getCommentInfo',
    value: function getCommentInfo(commentId) {
      var _this3 = this;

      var request = _DataRequests2.default.get('/api/comment/' + commentId, true);

      $.ajax(request).done(function (comment) {
        return _this3.getCommentInfoSuccess(comment);
      }).fail(function (err) {
        return _this3.getCommentInfoFail(err);
      });

      return true;
    }
  }, {
    key: 'editComment',
    value: function editComment(commentId, data) {
      var _this4 = this;

      var request = _DataRequests2.default.post('/api/comment/edit/' + commentId, data, true);

      $.ajax(request).done(function (comment) {
        return _this4.editCommentSuccess(comment);
      }).fail(function (err) {
        return _this4.editCommentFail(err);
      });
      return true;
    }
  }, {
    key: 'deleteComment',
    value: function deleteComment(commentId) {
      var _this5 = this;

      var requst = _DataRequests2.default.post('/api/comment/delete/' + commentId, {}, true);

      $.ajax(requst).done(function () {
        return _this5.deleteCommentSuccess();
      }).fail(function () {
        return _this5.deleteCommentFail();
      });

      return true;
    }
  }]);

  return PostCommentActions;
}();

exports.default = _alt2.default.createActions(PostCommentActions);

},{"../../DataRequests":70,"../../alt":85}],84:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

var _DataRequests = require('../../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostEditActions = function () {
  function PostEditActions() {
    _classCallCheck(this, PostEditActions);

    this.generateActions('handleContentChange', 'contentValidationFail', 'editPostSuccess', 'editPostFail', 'getEditPostInfoFail', 'getEditPostInfoSuccess');
  }

  _createClass(PostEditActions, [{
    key: 'getEditPostInfo',
    value: function getEditPostInfo(postId) {
      var _this = this;

      var request = _DataRequests2.default.get('/api/post/edit/' + postId, true);

      $.ajax(request).done(function (data) {
        _this.getEditPostInfoSuccess(data);
      }).fail(function (err) {
        console.log(err);
        _this.getEditPostInfoFail(err);
      });

      return true;
    }
  }, {
    key: 'editPost',
    value: function editPost(data) {
      var _this2 = this;

      var request = _DataRequests2.default.post('/api/post/edit/' + data.postId, data, true);

      $.ajax(request).done(function (data) {
        _this2.editPostSuccess(data);
      }).fail(function (err) {
        console.log(err);
        _this2.editPostFail(err);
      });

      return true;
    }
  }]);

  return PostEditActions;
}();

exports.default = _alt2.default.createActions(PostEditActions);

},{"../../DataRequests":70,"../../alt":85}],85:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('alt');

var _alt2 = _interopRequireDefault(_alt);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _alt2.default({
  batchingFunction: _reactDom2.default.unstable_batchedUpdates
});

},{"alt":3,"react-dom":"react-dom"}],86:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _AdminPanelStore = require('../stores/AdminPanelStore');

var _AdminPanelStore2 = _interopRequireDefault(_AdminPanelStore);

var _AdminPanelActions = require('../actions/AdminPanelActions');

var _AdminPanelActions2 = _interopRequireDefault(_AdminPanelActions);

var _Form = require('./form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('./form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('./form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AdminPanel = function (_Component) {
  _inherits(AdminPanel, _Component);

  function AdminPanel(props) {
    _classCallCheck(this, AdminPanel);

    var _this = _possibleConstructorReturn(this, (AdminPanel.__proto__ || Object.getPrototypeOf(AdminPanel)).call(this, props));

    _this.state = _AdminPanelStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(AdminPanel, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _AdminPanelStore2.default.listen(this.onChange);
      _AdminPanelActions2.default.loadAdminPanelForm();
      _AdminPanelActions2.default.getAdmins();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _AdminPanelStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var userForAdmin = this.state.userForAdmin;
      if (userForAdmin === '') {
        _AdminPanelActions2.default.contentValidationFail();
        return;
      }

      _AdminPanelActions2.default.addPost({ 'userForAdmin': userForAdmin });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      if (JSON.parse(window.localStorage.getItem('user')).roles.indexOf('Admin') < 0) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      var admins = this.state.admins.map(function (admin, index) {
        return _react2.default.createElement(
          'li',
          { key: admin._id, className: 'list-group-item' },
          admin.username
        );
      });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _Form2.default,
          {
            title: 'Make Admin',
            handleSubmit: this.handleSubmit.bind(this),
            submitState: this.state.formSubmitState,
            message: this.state.message },
          _react2.default.createElement(_TextGroup2.default, {
            type: 'text',
            value: this.state.userForAdmin,
            label: 'Username',
            handleChange: _AdminPanelActions2.default.handleContentChange,
            validationState: this.state.contentValidationState }),
          _react2.default.createElement(_Submit2.default, {
            type: 'btn-primary',
            value: 'Make Admin' })
        ),
        _react2.default.createElement(
          'div',
          { className: 'container' },
          _react2.default.createElement(
            'div',
            { className: 'row flipInX animated' },
            _react2.default.createElement(
              'div',
              { className: 'col-sm-8' },
              _react2.default.createElement(
                'div',
                { className: 'panel panel-default' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel-heading' },
                  'Current admins'
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'panel-body' },
                  _react2.default.createElement(
                    'ul',
                    { className: 'list-group' },
                    admins
                  )
                )
              )
            )
          )
        )
      );
    }
  }]);

  return AdminPanel;
}(_react.Component);

exports.default = AdminPanel;

},{"../actions/AdminPanelActions":71,"../components/Auth":88,"../stores/AdminPanelStore":129,"./form/Form":97,"./form/Submit":101,"./form/TextGroup":102,"react":"react","react-router-dom":57}],87:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _routes = require('../routes');

var _routes2 = _interopRequireDefault(_routes);

var _Navbar = require('./Navbar');

var _Navbar2 = _interopRequireDefault(_Navbar);

var _Footer = require('./Footer');

var _Footer2 = _interopRequireDefault(_Footer);

var _UserStore = require('../stores/UserStore');

var _UserStore2 = _interopRequireDefault(_UserStore);

var _UserActions = require('../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = _UserStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _UserStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _UserStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_Navbar2.default, { history: this.props.history }),
        _react2.default.createElement(_routes2.default, { history: this.props.history }),
        _react2.default.createElement(_Footer2.default, { history: this.props.history })
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;

},{"../actions/UserActions":81,"../routes":128,"../stores/UserStore":138,"./Footer":90,"./Navbar":92,"react":"react"}],88:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Auth = function () {
  function Auth() {
    _classCallCheck(this, Auth);
  }

  _createClass(Auth, null, [{
    key: 'saveUser',
    value: function saveUser(user) {
      window.localStorage.setItem('user', JSON.stringify(user));
    }
  }, {
    key: 'getUser',
    value: function getUser() {
      var userJson = window.localStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return {};
    }
  }, {
    key: 'removeUser',
    value: function removeUser() {
      window.localStorage.removeItem('user');
    }
  }, {
    key: 'authenticateUser',
    value: function authenticateUser(token) {
      window.localStorage.setItem('token', token);
    }
  }, {
    key: 'isUserAuthenticated',
    value: function isUserAuthenticated() {
      return window.localStorage.getItem('token') !== null;
    }
  }, {
    key: 'deauthenticateUser',
    value: function deauthenticateUser() {
      window.localStorage.removeItem('token');
    }
  }, {
    key: 'getToken',
    value: function getToken() {
      return window.localStorage.getItem('token');
    }
  }, {
    key: 'isUserAdmin',
    value: function isUserAdmin() {
      if (window.localStorage.getItem('user')) {
        return JSON.parse(window.localStorage.getItem('user')).roles.indexOf('Admin') >= 0;
      }
      return false;
    }
  }]);

  return Auth;
}();

exports.default = Auth;

},{}],89:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _UserStore = require('../stores/UserStore');

var _UserStore2 = _interopRequireDefault(_UserStore);

var _BlockUserStore = require('../stores/BlockUserStore');

var _BlockUserStore2 = _interopRequireDefault(_BlockUserStore);

var _BlockUserActions = require('../actions/BlockUserActions');

var _BlockUserActions2 = _interopRequireDefault(_BlockUserActions);

var _Form = require('./form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('./form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('./form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BlockUser = function (_Component) {
  _inherits(BlockUser, _Component);

  function BlockUser(props) {
    _classCallCheck(this, BlockUser);

    var _this = _possibleConstructorReturn(this, (BlockUser.__proto__ || Object.getPrototypeOf(BlockUser)).call(this, props));

    _this.state = _BlockUserStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(BlockUser, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _BlockUserStore2.default.listen(this.onChange);
      _BlockUserActions2.default.loadBlockUserForm();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _BlockUserStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var content = this.state.content;
      if (content === '') {
        _BlockUserActions2.default.contentValidationFail();
        return;
      }

      _BlockUserActions2.default.getUserForBlock({ 'currentUserID': _UserStore2.default.getState().loggedInUserId, 'usernameForBlock': content });
    }
  }, {
    key: 'render',
    value: function render() {
      if (_UserStore2.default.getState().loggedInUserId === '') {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Block user',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.formSubmitState,
          message: this.state.message },
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          value: this.state.content,
          label: 'Block user',
          handleChange: _BlockUserActions2.default.handleContentChange,
          validationState: this.state.contentValidationState }),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Block' })
      );
    }
  }]);

  return BlockUser;
}(_react.Component);

exports.default = BlockUser;

},{"../actions/BlockUserActions":72,"../stores/BlockUserStore":130,"../stores/UserStore":138,"./form/Form":97,"./form/Submit":101,"./form/TextGroup":102,"react":"react","react-router-dom":57}],90:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _FooterStore = require('../stores/FooterStore');

var _FooterStore2 = _interopRequireDefault(_FooterStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Footer = function (_Component) {
  _inherits(Footer, _Component);

  function Footer(props) {
    _classCallCheck(this, Footer);

    var _this = _possibleConstructorReturn(this, (Footer.__proto__ || Object.getPrototypeOf(Footer)).call(this, props));

    _this.state = _FooterStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(Footer, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _FooterStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _FooterStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'footer',
        null,
        _react2.default.createElement(
          'div',
          { className: 'container' },
          _react2.default.createElement(
            'div',
            { className: 'row' },
            _react2.default.createElement(
              'div',
              { className: 'col-sm-5' },
              _react2.default.createElement(
                'h3',
                { className: 'lead' },
                _react2.default.createElement(
                  'strong',
                  null,
                  'Information'
                ),
                ' and',
                _react2.default.createElement(
                  'strong',
                  null,
                  ' Copyright'
                )
              ),
              _react2.default.createElement(
                'p',
                null,
                'Powered by',
                _react2.default.createElement(
                  'strong',
                  null,
                  ' Express'
                ),
                ',',
                _react2.default.createElement(
                  'strong',
                  null,
                  ' MongoDB'
                ),
                ' and',
                _react2.default.createElement(
                  'strong',
                  null,
                  ' React'
                )
              ),
              _react2.default.createElement(
                'p',
                null,
                '@2017 SoftUni.'
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'col-sm-3' },
              _react2.default.createElement(
                'h3',
                { className: 'lead' },
                'Author'
              ),
              _react2.default.createElement(
                'a',
                { href: 'https://github.com/AndrianStoikov/ReactJs-Fundamentals-TeamWork' },
                _react2.default.createElement(
                  'strong',
                  null,
                  ' Team Unknown '
                )
              )
            )
          )
        )
      );
    }
  }]);

  return Footer;
}(_react.Component);

exports.default = Footer;

},{"../stores/FooterStore":131,"react":"react","react-router-dom":57}],91:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _HomeStore = require('../stores/HomeStore');

var _HomeStore2 = _interopRequireDefault(_HomeStore);

var _HomeActions = require('../actions/HomeActions');

var _HomeActions2 = _interopRequireDefault(_HomeActions);

var _UserPostsPanel = require('../components/sub-components/user-profile/UserPostsPanel');

var _UserPostsPanel2 = _interopRequireDefault(_UserPostsPanel);

var _Auth = require('./Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _reactPaginate = require('react-paginate');

var _reactPaginate2 = _interopRequireDefault(_reactPaginate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Home = function (_React$Component) {
  _inherits(Home, _React$Component);

  function Home(props) {
    _classCallCheck(this, Home);

    var _this = _possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).call(this, props));

    _this.state = _HomeStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(Home, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _HomeStore2.default.listen(this.onChange);
      if (_Auth2.default.isUserAuthenticated()) {
        _HomeActions2.default.getUserPosts();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _HomeStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handlePageChange',
    value: function handlePageChange(input) {
      var selected = input.selected;
      var offset = Math.ceil(selected * 10);

      _HomeActions2.default.handlePageChange(offset);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement(
          'h3',
          { className: 'text-center' },
          'Welcome to',
          _react2.default.createElement(
            'strong',
            null,
            ' Simple Social Network'
          )
        ),
        _react2.default.createElement(_UserPostsPanel2.default, {
          posts: this.state.postsToDisplay,
          getUserPost: _HomeActions2.default.getUserPosts
        }),
        _Auth2.default.isUserAuthenticated() && _react2.default.createElement(_reactPaginate2.default, {
          previousLabel: 'Previous',
          nextLabel: 'Next',
          breakLabel: _react2.default.createElement(
            'a',
            { href: '' },
            '...'
          ),
          breakClassName: '',
          pageCount: this.state.pageCount,
          marginPagesDisplayed: 2,
          pageRangeDisplayed: 5,
          onPageChange: this.handlePageChange,
          containerClassName: 'pagination',
          subContainerClassName: 'pages pagination',
          activeClassName: 'active' })
      );
    }
  }]);

  return Home;
}(_react2.default.Component);

exports.default = Home;

},{"../actions/HomeActions":75,"../components/sub-components/user-profile/UserPostsPanel":126,"../stores/HomeStore":133,"./Auth":88,"react":"react","react-paginate":45}],92:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _NavbarActions = require('../actions/NavbarActions');

var _NavbarActions2 = _interopRequireDefault(_NavbarActions);

var _NavbarStore = require('../stores/NavbarStore');

var _NavbarStore2 = _interopRequireDefault(_NavbarStore);

var _NavbarUserMenu = require('./sub-components/NavbarUserMenu');

var _NavbarUserMenu2 = _interopRequireDefault(_NavbarUserMenu);

var _SearchBar = require('../components/search-bar/SearchBar');

var _SearchBar2 = _interopRequireDefault(_SearchBar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Navbar = function (_React$Component) {
  _inherits(Navbar, _React$Component);

  function Navbar(props) {
    _classCallCheck(this, Navbar);

    var _this = _possibleConstructorReturn(this, (Navbar.__proto__ || Object.getPrototypeOf(Navbar)).call(this, props));

    _this.state = _NavbarStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(Navbar, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _NavbarStore2.default.listen(this.onChange);
      $(document).ajaxStart(function () {
        return _NavbarActions2.default.updateAjaxAnimation('fadeIn');
      });
      $(document).ajaxComplete(function () {
        return _NavbarActions2.default.updateAjaxAnimation('fadeOut');
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _NavbarStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'render',
    value: function render() {
      var navbarUserMenu = _react2.default.createElement(_NavbarUserMenu2.default, null);
      return _react2.default.createElement(
        'nav',
        { className: 'navbar navbar-default navbar-static-top' },
        _react2.default.createElement(
          'div',
          { className: 'navbar-header' },
          _react2.default.createElement(
            'button',
            {
              type: 'button',
              className: 'navbar-toggle collapsed',
              'data-toggle': 'collapse',
              'data-target': '#navbar' },
            _react2.default.createElement(
              'span',
              { className: 'sr-only' },
              'Toggle navigation'
            ),
            _react2.default.createElement('span', { className: 'icon-bar' }),
            _react2.default.createElement('span', { className: 'icon-bar' }),
            _react2.default.createElement('span', { className: 'icon-bar' })
          ),
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/', className: 'navbar-brand' },
            _react2.default.createElement(
              'span',
              {
                ref: 'triangles',
                className: 'triangles animated ' + this.state.ajaxAnimationClass },
              _react2.default.createElement('div', { className: 'tri invert' }),
              _react2.default.createElement('div', { className: 'tri invert' }),
              _react2.default.createElement('div', { className: 'tri' }),
              _react2.default.createElement('div', { className: 'tri invert' }),
              _react2.default.createElement('div', { className: 'tri invert' }),
              _react2.default.createElement('div', { className: 'tri' }),
              _react2.default.createElement('div', { className: 'tri invert' }),
              _react2.default.createElement('div', { className: 'tri' }),
              _react2.default.createElement('div', { className: 'tri invert' })
            ),
            'SSN'
          )
        ),
        _react2.default.createElement(
          'div',
          { id: 'navbar', className: 'navbar-collapse collapse' },
          _Auth2.default.isUserAuthenticated() ? _react2.default.createElement(
            'ul',
            { className: 'nav navbar-nav' },
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/' },
                'Home'
              )
            ),
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(_SearchBar2.default, { history: this.props.history })
            ),
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/post/add' },
                'AddPost'
              )
            ),
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/messenger' },
                'Messenger'
              )
            ),
            _Auth2.default.isUserAdmin() && _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/user/admin-panel' },
                'Admin Panel'
              )
            )
          ) : _react2.default.createElement(
            'ul',
            { className: 'nav navbar-nav' },
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                _reactRouterDom.Link,
                { to: '/' },
                'Home'
              )
            )
          ),
          navbarUserMenu
        )
      );
    }
  }]);

  return Navbar;
}(_react2.default.Component);

exports.default = Navbar;

},{"../actions/NavbarActions":77,"../components/Auth":88,"../components/search-bar/SearchBar":114,"../stores/NavbarStore":134,"./sub-components/NavbarUserMenu":117,"react":"react","react-router-dom":57}],93:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Auth = require('../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _reactRouterDom = require('react-router-dom');

var _ProfilePictureAddStore = require('../stores/ProfilePictureAddStore');

var _ProfilePictureAddStore2 = _interopRequireDefault(_ProfilePictureAddStore);

var _ProfilePictureAddActions = require('../actions/ProfilePictureAddActions');

var _ProfilePictureAddActions2 = _interopRequireDefault(_ProfilePictureAddActions);

var _ImageForm = require('./form/ImageForm');

var _ImageForm2 = _interopRequireDefault(_ImageForm);

var _TextGroup = require('./form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('./form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProfilePictureAdd = function (_Component) {
  _inherits(ProfilePictureAdd, _Component);

  function ProfilePictureAdd(props) {
    _classCallCheck(this, ProfilePictureAdd);

    var _this = _possibleConstructorReturn(this, (ProfilePictureAdd.__proto__ || Object.getPrototypeOf(ProfilePictureAdd)).call(this, props));

    _this.state = _ProfilePictureAddStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(ProfilePictureAdd, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _ProfilePictureAddStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _ProfilePictureAddStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var image = this.state.image;
      if (image === '') {
        _ProfilePictureAddActions2.default.contentValidationFail();
        return;
      }
      _ProfilePictureAddActions2.default.addProfilePicture({ 'image': image, userId: _Auth2.default.getUser()._id });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      return _react2.default.createElement(
        _ImageForm2.default,
        {
          title: 'Add New Profile Picture',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.formSubmitState,
          message: this.state.message },
        _react2.default.createElement('input', {
          type: 'file',
          name: 'image',
          label: 'Your New Profile Image',
          onChange: _ProfilePictureAddActions2.default.handleContentChange,
          validationState: this.state.contentValidationState }),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Add Image' })
      );
    }
  }]);

  return ProfilePictureAdd;
}(_react.Component);

exports.default = ProfilePictureAdd;

},{"../actions/ProfilePictureAddActions":79,"../components/Auth":88,"../stores/ProfilePictureAddStore":136,"./form/ImageForm":98,"./form/Submit":101,"./form/TextGroup":102,"react":"react","react-router-dom":57}],94:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('./Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _FormStore = require('../stores/FormStore');

var _FormStore2 = _interopRequireDefault(_FormStore);

var _FormActions = require('../actions/FormActions');

var _FormActions2 = _interopRequireDefault(_FormActions);

var _UserActions = require('../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

var _Form = require('./form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('./form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('./form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserLogin = function (_Component) {
  _inherits(UserLogin, _Component);

  function UserLogin(props) {
    _classCallCheck(this, UserLogin);

    var _this = _possibleConstructorReturn(this, (UserLogin.__proto__ || Object.getPrototypeOf(UserLogin)).call(this, props));

    _this.state = _FormStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(UserLogin, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _FormStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _FormStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var username = this.state.username;
      var password = this.state.password;
      if (!username) {
        _FormActions2.default.usernameValidationFail();
        return;
      }

      if (!password) {
        _FormActions2.default.passwordValidationFail();
        return;
      }

      _UserActions2.default.loginUser({ username: username, password: password });
    }
  }, {
    key: 'render',
    value: function render() {
      if (_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Login',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.formSubmitState,
          message: this.state.message },
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          value: this.state.username,
          label: 'Username',
          handleChange: _FormActions2.default.handleUsernameChange,
          validationState: this.state.usernameValidationState }),
        _react2.default.createElement(_TextGroup2.default, {
          type: 'password',
          value: this.state.password,
          label: 'Password',
          handleChange: _FormActions2.default.handlePasswordChange,
          validationState: this.state.passwordValidationState,
          message: this.state.message }),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Login' })
      );
    }
  }]);

  return UserLogin;
}(_react.Component);

exports.default = UserLogin;

},{"../actions/FormActions":74,"../actions/UserActions":81,"../stores/FormStore":132,"./Auth":88,"./form/Form":97,"./form/Submit":101,"./form/TextGroup":102,"react":"react","react-router-dom":57}],95:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('./Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _UserActions = require('../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

var _UserStore = require('../stores/UserStore');

var _UserStore2 = _interopRequireDefault(_UserStore);

var _UserInfo = require('./sub-components/user-profile/UserInfo');

var _UserInfo2 = _interopRequireDefault(_UserInfo);

var _UserPosts = require('./sub-components/user-profile/UserPosts');

var _UserPosts2 = _interopRequireDefault(_UserPosts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserProfile = function (_React$Component) {
  _inherits(UserProfile, _React$Component);

  function UserProfile(props) {
    _classCallCheck(this, UserProfile);

    var _this = _possibleConstructorReturn(this, (UserProfile.__proto__ || Object.getPrototypeOf(UserProfile)).call(this, props));

    _this.state = _UserStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(UserProfile, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _UserStore2.default.listen(this.onChange);
      _UserActions2.default.getUserOwnPosts(this.props.match.params.userId);
      _UserActions2.default.getUserInformation(this.props.match.params.userId);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _UserStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/' });
      }

      var nodes = {};
      nodes.roles = this.state.roles.map(function (role, index) {
        return _react2.default.createElement(
          'h4',
          { key: index, className: 'lead' },
          _react2.default.createElement(
            'strong',
            null,
            role
          )
        );
      });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_UserInfo2.default, {
          profile: this.state.profile }),
        _react2.default.createElement(_UserPosts2.default, {
          posts: this.state.userPosts,
          getUserPosts: _UserActions2.default.getUserOwnPosts.bind(this, this.props.match.params.userId)
        })
      );
    }
  }]);

  return UserProfile;
}(_react2.default.Component);

exports.default = UserProfile;

},{"../actions/UserActions":81,"../stores/UserStore":138,"./Auth":88,"./sub-components/user-profile/UserInfo":124,"./sub-components/user-profile/UserPosts":125,"react":"react","react-router-dom":57}],96:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('./Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _FormActions = require('../actions/FormActions');

var _FormActions2 = _interopRequireDefault(_FormActions);

var _UserActions = require('../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

var _FormStore = require('../stores/FormStore');

var _FormStore2 = _interopRequireDefault(_FormStore);

var _Form = require('./form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('./form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _RadioGroup = require('./form/RadioGroup');

var _RadioGroup2 = _interopRequireDefault(_RadioGroup);

var _RadioElement = require('./form/RadioElement');

var _RadioElement2 = _interopRequireDefault(_RadioElement);

var _Submit = require('./form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserRegister = function (_Component) {
  _inherits(UserRegister, _Component);

  function UserRegister(props) {
    _classCallCheck(this, UserRegister);

    var _this = _possibleConstructorReturn(this, (UserRegister.__proto__ || Object.getPrototypeOf(UserRegister)).call(this, props));

    _this.state = _FormStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(UserRegister, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _FormStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _FormStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var data = {
        username: this.state.username,
        password: this.state.password,
        confirmedPassword: this.state.confirmedPassword,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        age: this.state.age,
        gender: this.state.gender
      };

      if (!data.username) {
        return _FormActions2.default.usernameValidationFail();
      }

      if (!data.password || !data.confirmedPassword || data.password !== data.confirmedPassword) {
        return _FormActions2.default.passwordValidationFail();
      }

      _UserActions2.default.registerUser(data);
    }
  }, {
    key: 'render',
    value: function render() {
      if (_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Register',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.formSubmitState,
          message: this.state.message },
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          label: 'Username',
          value: this.state.username,
          autoFocus: 'true',
          handleChange: _FormActions2.default.handleUsernameChange,
          validationState: this.state.usernameValidationState,
          message: this.state.message }),
        _react2.default.createElement(_TextGroup2.default, {
          type: 'password',
          label: 'Password',
          value: this.state.Password,
          handleChange: _FormActions2.default.handlePasswordChange,
          validationState: this.state.passwordValidationState,
          message: this.state.message }),
        _react2.default.createElement(_TextGroup2.default, {
          type: 'password',
          label: 'Confirm Password',
          value: this.state.confirmPassword,
          handleChange: _FormActions2.default.handleConfirmedPasswordChange,
          validationState: this.state.passwordValidationState,
          message: this.state.message }),
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          label: 'First Name',
          handleChange: _FormActions2.default.handleFirstNameChange,
          value: this.state.firstName }),
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          label: 'Last Name',
          handleChange: _FormActions2.default.handleLastNameChange,
          value: this.state.lastName }),
        _react2.default.createElement(_TextGroup2.default, {
          type: 'number',
          label: 'Age',
          handleChange: _FormActions2.default.handleAgeChange,
          value: this.state.age }),
        _react2.default.createElement(
          _RadioGroup2.default,
          {
            validationState: this.state.genderValidationState,
            message: this.state.message },
          _react2.default.createElement(_RadioElement2.default, {
            groupName: 'gender',
            value: 'Male',
            selectedValue: this.state.gender,
            handleChange: _FormActions2.default.handleGenderChange }),
          _react2.default.createElement(_RadioElement2.default, {
            groupName: 'gender',
            value: 'Female',
            selectedValue: this.state.gender,
            handleChange: _FormActions2.default.handleGenderChange })
        ),
        _react2.default.createElement(_Submit2.default, { type: 'btn-primary', value: 'Register' })
      );
    }
  }]);

  return UserRegister;
}(_react.Component);

exports.default = UserRegister;

},{"../actions/FormActions":74,"../actions/UserActions":81,"../stores/FormStore":132,"./Auth":88,"./form/Form":97,"./form/RadioElement":99,"./form/RadioGroup":100,"./form/Submit":101,"./form/TextGroup":102,"react":"react","react-router-dom":57}],97:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Form = function (_Component) {
  _inherits(Form, _Component);

  function Form() {
    _classCallCheck(this, Form);

    return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
  }

  _createClass(Form, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement(
          'div',
          { className: 'row flipInX animated' },
          _react2.default.createElement(
            'div',
            { className: 'col-sm-8' },
            _react2.default.createElement(
              'div',
              { className: 'panel panel-default' },
              _react2.default.createElement(
                'div',
                { className: 'panel-heading' },
                this.props.title
              ),
              _react2.default.createElement(
                'div',
                { className: 'panel-body' },
                _react2.default.createElement(
                  'form',
                  { onSubmit: this.props.handleSubmit },
                  _react2.default.createElement(
                    'div',
                    { className: 'form-group ' + this.props.submitState },
                    _react2.default.createElement(
                      'span',
                      { className: 'help-block' },
                      this.props.message
                    )
                  ),
                  this.props.children
                )
              )
            )
          )
        )
      );
    }
  }]);

  return Form;
}(_react.Component);

exports.default = Form;

},{"react":"react"}],98:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Form = function (_Component) {
  _inherits(Form, _Component);

  function Form() {
    _classCallCheck(this, Form);

    return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
  }

  _createClass(Form, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement(
          'div',
          { className: 'row flipInX animated' },
          _react2.default.createElement(
            'div',
            { className: 'col-sm-8' },
            _react2.default.createElement(
              'div',
              { className: 'panel panel-default' },
              _react2.default.createElement(
                'div',
                { className: 'panel-heading' },
                this.props.title
              ),
              _react2.default.createElement(
                'div',
                { className: 'panel-body' },
                _react2.default.createElement(
                  'form',
                  { onSubmit: this.props.handleSubmit, encType: 'multipart/form-data', action: '' },
                  _react2.default.createElement(
                    'div',
                    { className: 'form-group ' + this.props.submitState },
                    _react2.default.createElement(
                      'span',
                      { className: 'help-block' },
                      this.props.message
                    )
                  ),
                  this.props.children
                )
              )
            )
          )
        )
      );
    }
  }]);

  return Form;
}(_react.Component);

exports.default = Form;

},{"react":"react"}],99:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RadioElement = function (_Component) {
  _inherits(RadioElement, _Component);

  function RadioElement() {
    _classCallCheck(this, RadioElement);

    return _possibleConstructorReturn(this, (RadioElement.__proto__ || Object.getPrototypeOf(RadioElement)).apply(this, arguments));
  }

  _createClass(RadioElement, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'radio radio-inline' },
        _react2.default.createElement('input', {
          type: 'radio',
          name: this.props.groupName,
          id: this.props.value.toLowerCase(),
          value: this.props.value,
          checked: this.props.selectedValue === this.props.value,
          onChange: this.props.handleChange }),
        _react2.default.createElement(
          'label',
          { htmlFor: this.props.value.toLowerCase() },
          this.props.value
        )
      );
    }
  }]);

  return RadioElement;
}(_react.Component);

exports.default = RadioElement;

},{"react":"react"}],100:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RadioGroup = function (_Component) {
  _inherits(RadioGroup, _Component);

  function RadioGroup() {
    _classCallCheck(this, RadioGroup);

    return _possibleConstructorReturn(this, (RadioGroup.__proto__ || Object.getPrototypeOf(RadioGroup)).apply(this, arguments));
  }

  _createClass(RadioGroup, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'form-group ' + this.props.validationState },
        _react2.default.createElement(
          'span',
          { className: 'help-block' },
          this.props.message
        ),
        this.props.children
      );
    }
  }]);

  return RadioGroup;
}(_react.Component);

exports.default = RadioGroup;

},{"react":"react"}],101:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Submit = function (_Component) {
  _inherits(Submit, _Component);

  function Submit() {
    _classCallCheck(this, Submit);

    return _possibleConstructorReturn(this, (Submit.__proto__ || Object.getPrototypeOf(Submit)).apply(this, arguments));
  }

  _createClass(Submit, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement('input', { type: 'submit', className: 'btn ' + this.props.type, value: this.props.value });
    }
  }]);

  return Submit;
}(_react.Component);

exports.default = Submit;

},{"react":"react"}],102:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextGroup = function (_Component) {
  _inherits(TextGroup, _Component);

  function TextGroup() {
    _classCallCheck(this, TextGroup);

    return _possibleConstructorReturn(this, (TextGroup.__proto__ || Object.getPrototypeOf(TextGroup)).apply(this, arguments));
  }

  _createClass(TextGroup, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'form-group ' + this.props.validationState },
        _react2.default.createElement(
          'label',
          { className: 'control-label' },
          this.props.label
        ),
        _react2.default.createElement('input', {
          type: this.props.type, className: 'form-control',
          value: this.props.value,
          onChange: this.props.handleChange, autoFocus: this.props.autoFocus }),
        _react2.default.createElement(
          'span',
          { className: 'help-block' },
          this.props.message
        )
      );
    }
  }]);

  return TextGroup;
}(_react.Component);

exports.default = TextGroup;

},{"react":"react"}],103:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Auth = require('../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Message = function (_React$Component) {
  _inherits(Message, _React$Component);

  function Message() {
    _classCallCheck(this, Message);

    return _possibleConstructorReturn(this, (Message.__proto__ || Object.getPrototypeOf(Message)).apply(this, arguments));
  }

  _createClass(Message, [{
    key: 'render',
    value: function render() {
      // Was the message sent by the current user. If so, add a css class\
      var currUser = _Auth2.default.getUser();
      var authorId = this.props.authorId;
      var fromMe = '';
      if (currUser._id === authorId) {
        fromMe = 'from-me';
      }

      return _react2.default.createElement(
        'div',
        { className: 'message ' + fromMe },
        _react2.default.createElement(
          'div',
          { className: 'username' },
          this.props.username
        ),
        _react2.default.createElement(
          'div',
          { className: 'message-body' },
          this.props.message
        )
      );
    }
  }]);

  return Message;
}(_react2.default.Component);

Message.defaultProps = {
  message: '',
  username: '',
  fromMe: false
};

exports.default = Message;

},{"../Auth":88,"react":"react"}],104:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Messages = require('./Messages');

var _Messages2 = _interopRequireDefault(_Messages);

var _MessageInput = require('../sub-components/Message-input');

var _MessageInput2 = _interopRequireDefault(_MessageInput);

var _MessageThreadStore = require('../../stores/messenger-stores/MessageThreadStore');

var _MessageThreadStore2 = _interopRequireDefault(_MessageThreadStore);

var _MessageActions = require('../../actions/MessageActions');

var _MessageActions2 = _interopRequireDefault(_MessageActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageThread = function (_React$Component) {
  _inherits(MessageThread, _React$Component);

  function MessageThread(props) {
    _classCallCheck(this, MessageThread);

    // set the initial state of messages so that it is not undefined on load
    var _this = _possibleConstructorReturn(this, (MessageThread.__proto__ || Object.getPrototypeOf(MessageThread)).call(this, props));

    _this.state = _MessageThreadStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    _this.sendHandler = _this.sendHandler.bind(_this);
    return _this;
  }

  _createClass(MessageThread, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _MessageThreadStore2.default.listen(this.onChange);
      if (this.props.username === 'Anonymous') {
        _MessageActions2.default.getThreadMessages(this.props.match.params.otherUserUsername);
      } else {
        _MessageActions2.default.getThreadMessages(this.props.username);
      }
    }
  }, {
    key: 'addMessage',
    value: function addMessage(message) {
      var threadId = this.state.threadId;
      _MessageActions2.default.sendMessage(message, threadId);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _MessageThreadStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'sendHandler',
    value: function sendHandler(content) {
      var messageObject = { content: content };
      this.addMessage(messageObject);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement(
          'h3',
          null,
          'Messenger'
        ),
        _react2.default.createElement(
          'h5',
          null,
          'Chat with ',
          this.props.match.params.otherUserUsername
        ),
        _react2.default.createElement(_Messages2.default, { messages: this.state.messages }),
        _react2.default.createElement(_MessageInput2.default, { onSend: this.sendHandler })
      );
    }
  }]);

  return MessageThread;
}(_react2.default.Component);

MessageThread.defaultProps = {
  username: 'Anonymous'
};

exports.default = MessageThread;

},{"../../actions/MessageActions":76,"../../stores/messenger-stores/MessageThreadStore":139,"../sub-components/Message-input":116,"./Messages":105,"react":"react"}],105:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MessageSingle = require('./MessageSingle');

var _MessageSingle2 = _interopRequireDefault(_MessageSingle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Messages = function (_React$Component) {
  _inherits(Messages, _React$Component);

  function Messages() {
    _classCallCheck(this, Messages);

    return _possibleConstructorReturn(this, (Messages.__proto__ || Object.getPrototypeOf(Messages)).apply(this, arguments));
  }

  _createClass(Messages, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // There is a new message in the state, scroll to bottom of list
      var objDiv = document.getElementById('messageList');
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, {
    key: 'render',
    value: function render() {
      // Loop through all the messages in the state and create a Message component
      var messages = this.props.messages.map(function (message) {
        return _react2.default.createElement(_MessageSingle2.default, {
          key: message._id,
          username: message.authorUsername,
          message: message.content,
          authorId: message.author
        });
      });

      return _react2.default.createElement(
        'div',
        { className: 'messages', id: 'messageList' },
        messages
      );
    }
  }]);

  return Messages;
}(_react2.default.Component);

Messages.defaultProps = {
  messages: []
};

exports.default = Messages;

},{"./MessageSingle":103,"react":"react"}],106:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MessengerStore = require('../../stores/messenger-stores/MessengerStore');

var _MessengerStore2 = _interopRequireDefault(_MessengerStore);

var _UserActions = require('../../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

var _Messages = require('./Messages');

var _Messages2 = _interopRequireDefault(_Messages);

var _MessageInput = require('../sub-components/Message-input');

var _MessageInput2 = _interopRequireDefault(_MessageInput);

var _MessageThread = require('./MessageThread');

var _MessageThread2 = _interopRequireDefault(_MessageThread);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Messenger = function (_React$Component) {
  _inherits(Messenger, _React$Component);

  function Messenger(props) {
    _classCallCheck(this, Messenger);

    var _this = _possibleConstructorReturn(this, (Messenger.__proto__ || Object.getPrototypeOf(Messenger)).call(this, props));

    _this.state = _MessengerStore2.default.getState();

    _this.onChange = _this.onChange.bind(_this);
    _this.usernameChangeHandler = _this.usernameChangeHandler.bind(_this);
    _this.usernameSubmitHandler = _this.usernameSubmitHandler.bind(_this);
    return _this;
  }

  _createClass(Messenger, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _MessengerStore2.default.listen(this.onChange);
      if (_Auth2.default.isUserAuthenticated()) {
        _UserActions2.default.getUserThreads();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _MessengerStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'usernameChangeHandler',
    value: function usernameChangeHandler(event) {
      this.setState({ username: event.target.value });
    }
  }, {
    key: 'usernameSubmitHandler',
    value: function usernameSubmitHandler(event) {
      event.preventDefault();
      this.setState({ submitted: true, username: this.state.username });
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.state.submitted) {
        // Form was submitted, now show the main App
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/thread/' + this.state.username })
        // <MessageThread username={this.state.username} />
        ;
      }

      var threadsRender = this.state.userThreads.map(function (thread) {
        if (thread.users[0] === _Auth2.default.getUser().username) {
          thread.otherUser = thread.users[1];
        } else {
          thread.otherUser = thread.users[0];
        }
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactRouterDom.Link,
            { key: thread._id, to: '/thread/' + thread.otherUser },
            thread.otherUser
          )
        );
      });

      return _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement(
          'h3',
          { className: 'text-center' },
          'Messenger'
        ),
        threadsRender,
        _react2.default.createElement(
          'form',
          { onSubmit: this.usernameSubmitHandler, className: 'username-container' },
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement('input', {
              type: 'text',
              onChange: this.usernameChangeHandler,
              placeholder: 'Enter a username...',
              required: true })
          ),
          _react2.default.createElement('input', { type: 'submit', value: 'Submit' })
        )
      );
    }
  }]);

  return Messenger;
}(_react2.default.Component);

exports.default = Messenger;

},{"../../actions/UserActions":81,"../../stores/messenger-stores/MessengerStore":140,"../Auth":88,"../sub-components/Message-input":116,"./MessageThread":104,"./Messages":105,"react":"react","react-router-dom":57}],107:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _PostAddStore = require('../../stores/post-stores/PostAddStore');

var _PostAddStore2 = _interopRequireDefault(_PostAddStore);

var _PostAddActions = require('../../actions/post-actions/PostAddActions');

var _PostAddActions2 = _interopRequireDefault(_PostAddActions);

var _Form = require('../form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('../form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('../form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostAdd = function (_Component) {
  _inherits(PostAdd, _Component);

  function PostAdd(props) {
    _classCallCheck(this, PostAdd);

    var _this = _possibleConstructorReturn(this, (PostAdd.__proto__ || Object.getPrototypeOf(PostAdd)).call(this, props));

    _this.state = _PostAddStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(PostAdd, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _PostAddStore2.default.listen(this.onChange);
      _PostAddActions2.default.loadPostAddForm();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostAddStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var content = this.state.content;
      if (content === '') {
        _PostAddActions2.default.contentValidationFail();
        return;
      }

      _PostAddActions2.default.addPost({ 'authorId': _Auth2.default.getUser()._id, 'content': content });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'New Post',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.formSubmitState,
          message: this.state.message },
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          value: this.state.content,
          label: 'Your Post',
          handleChange: _PostAddActions2.default.handleContentChange,
          validationState: this.state.contentValidationState }),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Post' })
      );
    }
  }]);

  return PostAdd;
}(_react.Component);

exports.default = PostAdd;

},{"../../actions/post-actions/PostAddActions":82,"../../components/Auth":88,"../../stores/post-stores/PostAddStore":141,"../form/Form":97,"../form/Submit":101,"../form/TextGroup":102,"react":"react","react-router-dom":57}],108:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _reactRouterDom = require('react-router-dom');

var _PostDeleteStore = require('../../stores/PostDeleteStore');

var _PostDeleteStore2 = _interopRequireDefault(_PostDeleteStore);

var _PostDeleteActions = require('../../actions/PostDeleteActions');

var _PostDeleteActions2 = _interopRequireDefault(_PostDeleteActions);

var _Form = require('../form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('../form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('../form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostDelete = function (_Component) {
  _inherits(PostDelete, _Component);

  function PostDelete(props) {
    _classCallCheck(this, PostDelete);

    var _this = _possibleConstructorReturn(this, (PostDelete.__proto__ || Object.getPrototypeOf(PostDelete)).call(this, props));

    _this.state = _PostDeleteStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(PostDelete, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _PostDeleteStore2.default.listen(this.onChange);
      if (_Auth2.default.isUserAuthenticated()) {
        var postId = this.props.match.params.postId;
        _PostDeleteActions2.default.getDeletePostInfo(postId);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostDeleteStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      _PostDeleteActions2.default.deletePost({ 'postId': this.props.match.params.postId });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Delete Post',
          handleSubmit: this.handleSubmit.bind(this),
          message: this.state.message },
        _react2.default.createElement(
          'div',
          { className: 'form-group ' },
          _react2.default.createElement(
            'label',
            { className: 'control-label' },
            'Your Post'
          ),
          _react2.default.createElement('input', {
            type: 'text', className: 'form-control',
            value: this.state.content,
            disabled: true }),
          _react2.default.createElement(
            'span',
            { className: 'help-block' },
            this.state.message
          )
        ),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-danger',
          value: 'Delete Post' })
      );
    }
  }]);

  return PostDelete;
}(_react.Component);

exports.default = PostDelete;

},{"../../actions/PostDeleteActions":78,"../../components/Auth":88,"../../stores/PostDeleteStore":135,"../form/Form":97,"../form/Submit":101,"../form/TextGroup":102,"react":"react","react-router-dom":57}],109:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _reactRouterDom = require('react-router-dom');

var _PostEditStore = require('../../stores/post-stores/PostEditStore');

var _PostEditStore2 = _interopRequireDefault(_PostEditStore);

var _PostEditActions = require('../../actions/post-actions/PostEditActions');

var _PostEditActions2 = _interopRequireDefault(_PostEditActions);

var _Form = require('../form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('../form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('../form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostEdit = function (_Component) {
  _inherits(PostEdit, _Component);

  function PostEdit(props) {
    _classCallCheck(this, PostEdit);

    var _this = _possibleConstructorReturn(this, (PostEdit.__proto__ || Object.getPrototypeOf(PostEdit)).call(this, props));

    _this.state = _PostEditStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(PostEdit, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _PostEditStore2.default.listen(this.onChange);
      if (_Auth2.default.getUser()._id) {
        var postId = this.props.match.params.postId;
        _PostEditActions2.default.getEditPostInfo(postId);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostEditStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var content = this.state.content;
      if (content === '') {
        _PostEditActions2.default.contentValidationFail();
        return;
      }

      _PostEditActions2.default.editPost({ 'content': content, 'postId': this.props.match.params.postId });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Edit Post',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.formSubmitState,
          message: this.state.message },
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          value: this.state.content,
          label: 'Your Post',
          handleChange: _PostEditActions2.default.handleContentChange,
          validationState: this.state.contentValidationState }),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Edit Post' })
      );
    }
  }]);

  return PostEdit;
}(_react.Component);

exports.default = PostEdit;

},{"../../actions/post-actions/PostEditActions":84,"../../components/Auth":88,"../../stores/post-stores/PostEditStore":143,"../form/Form":97,"../form/Submit":101,"../form/TextGroup":102,"react":"react","react-router-dom":57}],110:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Comment = function (_Component) {
  _inherits(Comment, _Component);

  function Comment() {
    _classCallCheck(this, Comment);

    return _possibleConstructorReturn(this, (Comment.__proto__ || Object.getPrototypeOf(Comment)).apply(this, arguments));
  }

  _createClass(Comment, [{
    key: 'render',
    value: function render() {
      var editButton = void 0;
      var deleteButton = void 0;

      if (_Auth2.default.getUser()._id) {
        editButton = _react2.default.createElement(
          _reactRouterDom.Link,
          {
            to: '/comment/edit/' + this.props.comment._id,
            className: 'btn btn-warning' },
          'Edit Comment'
        );
        deleteButton = _react2.default.createElement(
          _reactRouterDom.Link,
          {
            to: '/comment/delete/' + this.props.comment._id,
            className: 'btn btn-danger' },
          'Delete Comment'
        );
      }

      return _react2.default.createElement(
        'div',
        { key: this.props.comment._id, className: 'comment col-sm-9 list-group-item animated fadeIn' },
        _react2.default.createElement(
          'div',
          { className: 'media' },
          _react2.default.createElement(
            'div',
            { className: 'media-body' },
            _react2.default.createElement(
              'p',
              null,
              this.props.comment.content
            )
          ),
          editButton,
          deleteButton
        )
      );
    }
  }]);

  return Comment;
}(_react.Component);

exports.default = Comment;

},{"../../Auth":88,"react":"react","react-router-dom":57}],111:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Auth = require('../../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _reactRouterDom = require('react-router-dom');

var _Form = require('../../form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _Submit = require('../../form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

var _PostCommentActions = require('../../../actions/post-actions/PostCommentActions');

var _PostCommentActions2 = _interopRequireDefault(_PostCommentActions);

var _PostCommentStore = require('../../../stores/post-stores/PostCommentStore');

var _PostCommentStore2 = _interopRequireDefault(_PostCommentStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DeleteComment = function (_Component) {
  _inherits(DeleteComment, _Component);

  function DeleteComment(props) {
    _classCallCheck(this, DeleteComment);

    var _this = _possibleConstructorReturn(this, (DeleteComment.__proto__ || Object.getPrototypeOf(DeleteComment)).call(this, props));

    _this.state = _PostCommentStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(DeleteComment, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      _PostCommentStore2.default.listen(this.onChange);
      if (_Auth2.default.getUser()._id) {
        var commentId = this.props.match.params.id;
        _PostCommentActions2.default.getCommentInfo(commentId);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostCommentStore2.default.unlisten(this.onChange);
      _PostCommentActions2.default.clearRedirectSuccess();
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();
      _PostCommentActions2.default.deleteComment(this.props.match.params.id);
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      if (this.state.redirect) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Delete Comment',
          handleSubmit: this.handleSubmit.bind(this),
          message: this.state.deleteCommentMessage },
        _react2.default.createElement(
          'div',
          { className: 'form-group ' },
          _react2.default.createElement(
            'label',
            { className: 'control-label' },
            'Your Comment'
          ),
          _react2.default.createElement('input', {
            type: 'text', className: 'form-control',
            value: this.state.editContent,
            disabled: true }),
          _react2.default.createElement(
            'span',
            { className: 'help-block' },
            this.state.deleteCommentMessage
          )
        ),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Delete Comment' })
      );
    }
  }]);

  return DeleteComment;
}(_react.Component);

exports.default = DeleteComment;

},{"../../../actions/post-actions/PostCommentActions":83,"../../../stores/post-stores/PostCommentStore":142,"../../Auth":88,"../../form/Form":97,"../../form/Submit":101,"react":"react","react-router-dom":57}],112:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Auth = require('../../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _reactRouterDom = require('react-router-dom');

var _Form = require('../../form/Form');

var _Form2 = _interopRequireDefault(_Form);

var _TextGroup = require('../../form/TextGroup');

var _TextGroup2 = _interopRequireDefault(_TextGroup);

var _Submit = require('../../form/Submit');

var _Submit2 = _interopRequireDefault(_Submit);

var _PostCommentActions = require('../../../actions/post-actions/PostCommentActions');

var _PostCommentActions2 = _interopRequireDefault(_PostCommentActions);

var _PostCommentStore = require('../../../stores/post-stores/PostCommentStore');

var _PostCommentStore2 = _interopRequireDefault(_PostCommentStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EditComment = function (_Component) {
  _inherits(EditComment, _Component);

  function EditComment(props) {
    _classCallCheck(this, EditComment);

    var _this = _possibleConstructorReturn(this, (EditComment.__proto__ || Object.getPrototypeOf(EditComment)).call(this, props));

    _this.state = _PostCommentStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(EditComment, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      _PostCommentStore2.default.listen(this.onChange);
      if (_Auth2.default.getUser()._id) {
        var commentId = this.props.match.params.id;
        _PostCommentActions2.default.getCommentInfo(commentId);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostCommentStore2.default.unlisten(this.onChange);
      _PostCommentActions2.default.clearRedirectSuccess();
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      var content = this.state.editContent;
      if (content === '') {
        _PostCommentActions2.default.editCommentValidationFail();
        return;
      }

      _PostCommentActions2.default.editComment(this.props.match.params.id, { 'content': content });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      if (this.state.redirect) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/' });
      }

      return _react2.default.createElement(
        _Form2.default,
        {
          title: 'Edit Comment',
          handleSubmit: this.handleSubmit.bind(this),
          submitState: this.state.editCommentFormSubmitState,
          message: this.state.editCommentMessage },
        _react2.default.createElement(_TextGroup2.default, {
          type: 'text',
          value: this.state.editContent,
          label: 'Your Comment',
          handleChange: _PostCommentActions2.default.handleEditCommentChange,
          validationState: this.state.editCommentContentValidationState }),
        _react2.default.createElement(_Submit2.default, {
          type: 'btn-primary',
          value: 'Edit Comment' })
      );
    }
  }]);

  return EditComment;
}(_react.Component);

exports.default = EditComment;

},{"../../../actions/post-actions/PostCommentActions":83,"../../../stores/post-stores/PostCommentStore":142,"../../Auth":88,"../../form/Form":97,"../../form/Submit":101,"../../form/TextGroup":102,"react":"react","react-router-dom":57}],113:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _CommentsForm = require('../../sub-components/CommentsForm');

var _CommentsForm2 = _interopRequireDefault(_CommentsForm);

var _PostDetails = require('../../sub-components/PostDetails');

var _PostDetails2 = _interopRequireDefault(_PostDetails);

var _Comment = require('./Comment');

var _Comment2 = _interopRequireDefault(_Comment);

var _PostCommentStore = require('../../../stores/post-stores/PostCommentStore');

var _PostCommentStore2 = _interopRequireDefault(_PostCommentStore);

var _PostCommentActions = require('../../../actions/post-actions/PostCommentActions');

var _PostCommentActions2 = _interopRequireDefault(_PostCommentActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostComment = function (_Component) {
  _inherits(PostComment, _Component);

  function PostComment(props) {
    _classCallCheck(this, PostComment);

    var _this = _possibleConstructorReturn(this, (PostComment.__proto__ || Object.getPrototypeOf(PostComment)).call(this, props));

    _this.state = _PostCommentStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(PostComment, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      if (!this.state.comment) {
        _PostCommentActions2.default.commentValidationFail();
        return;
      }
      _PostCommentActions2.default.addComment(this.props.postId, this.state.comment);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _PostCommentStore2.default.listen(this.onChange);
      _PostCommentActions2.default.getPostInfo(this.props.match.params.postId);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostCommentStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'render',
    value: function render() {
      if (!_Auth2.default.isUserAuthenticated()) {
        return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
      }

      var comments = this.state.comments.map(function (comment) {
        return _react2.default.createElement(_Comment2.default, { key: comment._id, comment: comment });
      });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_PostDetails2.default, { post: this.state.post }),
        _react2.default.createElement(
          'div',
          { className: 'list-group' },
          _react2.default.createElement(
            'h3',
            { className: 'col-sm-3' },
            'Comments:'
          ),
          comments,
          _react2.default.createElement(
            'div',
            { className: 'col-sm-6 col-xs-offset-6 list-group-item animated fadeIn' },
            _react2.default.createElement(
              'div',
              { className: 'media' },
              _react2.default.createElement(_CommentsForm2.default, { postId: this.state.post })
            )
          )
        )
      );
    }
  }]);

  return PostComment;
}(_react.Component);

exports.default = PostComment;

},{"../../../actions/post-actions/PostCommentActions":83,"../../../stores/post-stores/PostCommentStore":142,"../../Auth":88,"../../sub-components/CommentsForm":115,"../../sub-components/PostDetails":120,"./Comment":110,"react":"react","react-router-dom":57}],114:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _SearchBarActions = require('../../actions/SearchBarActions');

var _SearchBarActions2 = _interopRequireDefault(_SearchBarActions);

var _SearchBarStore = require('../../stores/SearchBarStore');

var _SearchBarStore2 = _interopRequireDefault(_SearchBarStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchBar = function (_Component) {
    _inherits(SearchBar, _Component);

    function SearchBar(props) {
        _classCallCheck(this, SearchBar);

        var _this = _possibleConstructorReturn(this, (SearchBar.__proto__ || Object.getPrototypeOf(SearchBar)).call(this, props));

        _this.state = _SearchBarStore2.default.getState();
        _this.onChange = _this.onChange.bind(_this);
        return _this;
    }

    _createClass(SearchBar, [{
        key: 'onChange',
        value: function onChange(state) {
            this.setState(state);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _SearchBarStore2.default.listen(this.onChange);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _SearchBarStore2.default.unlisten(this.onChange);
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(e) {
            e.preventDefault();

            var content = this.state.content;
            console.log(content);
            //if (content === '') {
            //    PostAddActions.contentValidationFail()
            //    return
            //}


            _SearchBarActions2.default.loadSearchBarForm();
            this.props.history.push("/nqkude");
        }
    }, {
        key: 'render',
        value: function render() {
            if (!_Auth2.default.isUserAuthenticated()) {
                return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/user/login' });
            }

            return _react2.default.createElement(
                'form',
                { className: 'navbar-form', onSubmit: this.handleSubmit.bind(this) },
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement('input', { type: 'text', className: 'form-control', value: this.state.content, onChange: _SearchBarActions2.default.handleContentChange, name: 'content' }),
                    _react2.default.createElement(
                        'div',
                        { className: 'input-group-btn' },
                        _react2.default.createElement('input', { type: 'submit', className: 'btn btn-primary', value: 'Find' })
                    )
                )
            );
        }
    }]);

    return SearchBar;
}(_react.Component);

exports.default = SearchBar;

},{"../../actions/SearchBarActions":80,"../../components/Auth":88,"../../stores/SearchBarStore":137,"react":"react","react-router-dom":57}],115:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PostCommentStore = require('../../stores/post-stores/PostCommentStore');

var _PostCommentStore2 = _interopRequireDefault(_PostCommentStore);

var _PostCommentActions = require('../../actions/post-actions/PostCommentActions');

var _PostCommentActions2 = _interopRequireDefault(_PostCommentActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommentsForm = function (_Component) {
  _inherits(CommentsForm, _Component);

  function CommentsForm(props) {
    _classCallCheck(this, CommentsForm);

    var _this = _possibleConstructorReturn(this, (CommentsForm.__proto__ || Object.getPrototypeOf(CommentsForm)).call(this, props));

    _this.state = _PostCommentStore2.default.getState();
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(CommentsForm, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _PostCommentStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _PostCommentStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(e) {
      e.preventDefault();

      if (!this.state.comment) {
        _PostCommentActions2.default.commentValidationFail();
        return;
      }

      _PostCommentActions2.default.addComment(this.state.post._id, this.state.comment);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'form',
        { onSubmit: this.handleSubmit.bind(this) },
        _react2.default.createElement(
          'div',
          { className: 'form-group ' + this.state.commentValidationState },
          _react2.default.createElement(
            'label',
            { className: 'control-label', htmlFor: 'content' },
            'Add comment'
          ),
          _react2.default.createElement('textarea', {
            id: 'content',
            className: 'form-control',
            value: this.state.comment,
            onChange: _PostCommentActions2.default.handleCommentChange,
            rows: '5' }),
          _react2.default.createElement(
            'span',
            { className: 'help-block' },
            this.state.message
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'form-group' },
          _react2.default.createElement('input', { type: 'submit', className: 'btn btn-primary', value: 'Comment' })
        )
      );
    }
  }]);

  return CommentsForm;
}(_react.Component);

exports.default = CommentsForm;

},{"../../actions/post-actions/PostCommentActions":83,"../../stores/post-stores/PostCommentStore":142,"react":"react"}],116:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageInput = function (_React$Component) {
  _inherits(MessageInput, _React$Component);

  function MessageInput(props) {
    _classCallCheck(this, MessageInput);

    var _this = _possibleConstructorReturn(this, (MessageInput.__proto__ || Object.getPrototypeOf(MessageInput)).call(this, props));

    _this.state = { chatInput: ''

      // React ES6 does not bind 'this' to event handlers by default
    };_this.submitHandler = _this.submitHandler.bind(_this);
    _this.textChangeHandler = _this.textChangeHandler.bind(_this);
    return _this;
  }

  _createClass(MessageInput, [{
    key: 'submitHandler',
    value: function submitHandler(event) {
      // Stop the form from refreshing the page on submit
      event.preventDefault();

      // Clear the input box
      this.setState({ chatInput: '' });

      // Call the onSend callback with the chatInput message
      this.props.onSend(this.state.chatInput);
    }
  }, {
    key: 'textChangeHandler',
    value: function textChangeHandler(event) {
      this.setState({ chatInput: event.target.value });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'form',
        { className: 'chat-input', onSubmit: this.submitHandler },
        _react2.default.createElement('input', { type: 'text',
          onChange: this.textChangeHandler,
          value: this.state.chatInput,
          placeholder: 'Write a message...',
          required: true })
      );
    }
  }]);

  return MessageInput;
}(_react2.default.Component);

MessageInput.defaultProps = {};

exports.default = MessageInput;

},{"react":"react"}],117:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _UserActions = require('../../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

var _UserStore = require('../../stores/UserStore');

var _UserStore2 = _interopRequireDefault(_UserStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NavbarUserMenu = function (_React$Component) {
  _inherits(NavbarUserMenu, _React$Component);

  function NavbarUserMenu(props) {
    _classCallCheck(this, NavbarUserMenu);

    var _this = _possibleConstructorReturn(this, (NavbarUserMenu.__proto__ || Object.getPrototypeOf(NavbarUserMenu)).call(this, props));

    _this.state = _UserStore2.default.getState();
    _this.handleLogout = _this.handleLogout.bind(_this);
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  _createClass(NavbarUserMenu, [{
    key: 'onChange',
    value: function onChange(state) {
      this.setState(state);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      _UserStore2.default.listen(this.onChange);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _UserStore2.default.unlisten(this.onChange);
    }
  }, {
    key: 'handleLogout',
    value: function handleLogout(e) {
      _UserActions2.default.logoutUser();
      this.props.history.push('/user/login');
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _Auth2.default.isUserAuthenticated() ? _react2.default.createElement(
          'ul',
          { className: 'nav navbar-nav pull-right' },
          _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              'div',
              { className: 'navbar-text' },
              'Hello, ',
              _Auth2.default.getUser().username
            )
          ),
          _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/user/profile-picture/' + _Auth2.default.getUser()._id },
              'Add Profile Picture'
            )
          ),
          _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/user/profile/' + _Auth2.default.getUser()._id },
              'Profile'
            )
          ),
          _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              'a',
              { href: '#', onClick: this.handleLogout },
              'Logout'
            )
          )
        ) : _react2.default.createElement(
          'ul',
          { className: 'nav navbar-nav pull-right' },
          _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/user/login' },
              'Login'
            )
          ),
          _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              _reactRouterDom.Link,
              { to: '/user/register' },
              'Register'
            )
          )
        )
      );
    }
  }]);

  return NavbarUserMenu;
}(_react2.default.Component);

exports.default = (0, _reactRouterDom.withRouter)(NavbarUserMenu);

},{"../../actions/UserActions":81,"../../components/Auth":88,"../../stores/UserStore":138,"react":"react","react-router-dom":57}],118:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PostInfo = require('./PostInfo');

var _PostInfo2 = _interopRequireDefault(_PostInfo);

var _PostPanelsToggle = require('./PostPanelsToggle');

var _PostPanelsToggle2 = _interopRequireDefault(_PostPanelsToggle);

var _PostCommentsPanel = require('./PostCommentsPanel');

var _PostCommentsPanel2 = _interopRequireDefault(_PostCommentsPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostCard = function (_React$Component) {
  _inherits(PostCard, _React$Component);

  function PostCard(props) {
    _classCallCheck(this, PostCard);

    var _this = _possibleConstructorReturn(this, (PostCard.__proto__ || Object.getPrototypeOf(PostCard)).call(this, props));

    _this.state = {
      showCommentsPanel: false
    };
    return _this;
  }

  _createClass(PostCard, [{
    key: 'toggleCommentsPanel',
    value: function toggleCommentsPanel() {
      this.setState(function (prevState) {
        return {
          showCommentsPanel: !prevState.showCommentsPanel,
          showVotePanel: false
        };
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'animated fadeIn' },
        _react2.default.createElement(
          'div',
          { className: 'media movie' },
          _react2.default.createElement(
            'span',
            { className: 'position pull-left' },
            this.props.index + 1
          ),
          _react2.default.createElement(_PostInfo2.default, { post: this.props.post }),
          _react2.default.createElement(_PostPanelsToggle2.default, {
            toggleCommentsPanel: this.toggleCommentsPanel.bind(this),
            showCommentsPanel: this.state.showCommentsPanel,
            likePost: this.props.likePost,
            unlikePost: this.props.unlikePost,
            postLikes: this.props.post.likes,
            postId: this.props.post._id,
            post: this.props.post })
        ),
        this.state.showCommentsPanel ? _react2.default.createElement(_PostCommentsPanel2.default, { comments: this.props.post.comments, postId: this.props.post._id }) : null,
        _react2.default.createElement('div', { id: 'clear' })
      );
    }
  }]);

  return PostCard;
}(_react2.default.Component);

exports.default = PostCard;

},{"./PostCommentsPanel":119,"./PostInfo":121,"./PostPanelsToggle":122,"react":"react"}],119:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Comment = require('../post/comments/Comment');

var _Comment2 = _interopRequireDefault(_Comment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostCommentsPanel = function (_React$Component) {
  _inherits(PostCommentsPanel, _React$Component);

  function PostCommentsPanel() {
    _classCallCheck(this, PostCommentsPanel);

    return _possibleConstructorReturn(this, (PostCommentsPanel.__proto__ || Object.getPrototypeOf(PostCommentsPanel)).apply(this, arguments));
  }

  _createClass(PostCommentsPanel, [{
    key: 'render',
    value: function render() {
      var comments = this.props.comments.map(function (comment) {
        return _react2.default.createElement(_Comment2.default, { key: comment._id, comment: comment });
      });

      return _react2.default.createElement(
        'div',
        { className: 'list-group' },
        _react2.default.createElement(
          'h3',
          { className: 'col-sm-3' },
          'Comments:'
        ),
        comments
      );
    }
  }]);

  return PostCommentsPanel;
}(_react2.default.Component);

exports.default = PostCommentsPanel;

},{"../post/comments/Comment":110,"react":"react"}],120:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostInfo = function (_React$Component) {
  _inherits(PostInfo, _React$Component);

  function PostInfo() {
    _classCallCheck(this, PostInfo);

    return _possibleConstructorReturn(this, (PostInfo.__proto__ || Object.getPrototypeOf(PostInfo)).apply(this, arguments));
  }

  _createClass(PostInfo, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'col-xs-12' },
        _react2.default.createElement('br', null),
        _react2.default.createElement(
          'h2',
          null,
          this.props.post.content
        ),
        _react2.default.createElement(
          'span',
          { className: 'votes' },
          'Likes:',
          _react2.default.createElement(
            'strong',
            null,
            ' ',
            this.props.post.likes.length
          )
        )
      );
    }
  }]);

  return PostInfo;
}(_react2.default.Component);

exports.default = PostInfo;

},{"react":"react"}],121:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostInfo = function (_React$Component) {
  _inherits(PostInfo, _React$Component);

  function PostInfo() {
    _classCallCheck(this, PostInfo);

    return _possibleConstructorReturn(this, (PostInfo.__proto__ || Object.getPrototypeOf(PostInfo)).apply(this, arguments));
  }

  _createClass(PostInfo, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'media-body' },
        _react2.default.createElement(
          'h4',
          { className: 'media-heading' },
          _react2.default.createElement(
            _reactRouterDom.Link,
            { to: '/movie/' + this.props.post._id + '/' + this.props.post.name },
            this.props.post.name
          )
        ),
        _react2.default.createElement('br', null),
        _react2.default.createElement(
          'p',
          null,
          this.props.post.content
        ),
        _react2.default.createElement(
          'span',
          { className: 'votes' },
          'Likes:',
          _react2.default.createElement(
            'strong',
            null,
            ' ',
            this.props.post.likes.length
          )
        )
      );
    }
  }]);

  return PostInfo;
}(_react2.default.Component);

exports.default = PostInfo;

},{"react":"react","react-router-dom":57}],122:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Auth = require('../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PostPanelToggles = function (_React$Component) {
  _inherits(PostPanelToggles, _React$Component);

  function PostPanelToggles() {
    _classCallCheck(this, PostPanelToggles);

    return _possibleConstructorReturn(this, (PostPanelToggles.__proto__ || Object.getPrototypeOf(PostPanelToggles)).apply(this, arguments));
  }

  _createClass(PostPanelToggles, [{
    key: 'isLiked',
    value: function isLiked() {
      var currentUserId = _Auth2.default.getUser()._id;
      var likes = this.props.postLikes;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = likes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var like = _step.value;

          if (currentUserId === like.toString()) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      var likeButton = void 0;
      if (this.isLiked()) {
        likeButton = _react2.default.createElement(
          'a',
          {
            className: 'btn btn-primary',
            onClick: this.props.unlikePost },
          'Unlike'
        );
      } else {
        likeButton = _react2.default.createElement(
          'a',
          {
            className: 'btn btn-primary',
            onClick: this.props.likePost },
          'Like'
        );
      }

      var editMovie = void 0;
      var deleteMovie = void 0;
      if (this.props.post.author === _Auth2.default.getUser()._id || _Auth2.default.isUserAdmin()) {
        editMovie = _react2.default.createElement(
          _reactRouterDom.Link,
          {
            to: '/post/edit/' + this.props.post._id,
            className: 'btn btn-warning' },
          'Edit Post'
        );
        deleteMovie = _react2.default.createElement(
          _reactRouterDom.Link,
          {
            to: '/post/delete/' + this.props.post._id,
            className: 'btn btn-danger' },
          'Delete Post'
        );
      }
      return _react2.default.createElement(
        'div',
        { className: 'pull-right btn-group' },
        _react2.default.createElement(
          _reactRouterDom.Link,
          { to: '/post/comment/' + this.props.postId, className: 'btn btn-primary' },
          'Comment post'
        ),
        editMovie,
        deleteMovie,
        _react2.default.createElement(
          'a',
          {
            className: 'btn btn-primary',
            onClick: this.props.toggleCommentsPanel },
          this.props.showCommentsPanel ? 'Hide' : 'Comments'
        ),
        likeButton
      );
    }
  }]);

  return PostPanelToggles;
}(_react2.default.Component);

exports.default = PostPanelToggles;

},{"../Auth":88,"react":"react","react-router-dom":57}],123:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _DataRequests = require('../../../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

var _Auth = require('../../Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _UserActions = require('../../../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserFollow = function (_Component) {
  _inherits(UserFollow, _Component);

  function UserFollow(props) {
    _classCallCheck(this, UserFollow);

    var _this = _possibleConstructorReturn(this, (UserFollow.__proto__ || Object.getPrototypeOf(UserFollow)).call(this, props));

    _this.state = {
      change: false
    };
    return _this;
  }

  _createClass(UserFollow, [{
    key: 'isAlreadyFollowed',
    value: function isAlreadyFollowed() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _Auth2.default.getUser().follows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          if (this.props.userId.toString() === id.toString()) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }
  }, {
    key: 'followUser',
    value: function followUser(e) {
      var _this2 = this;

      e.preventDefault();

      var request = _DataRequests2.default.post('/api/user/follow/' + this.props.userId, {}, true);

      $.ajax(request).done(function (user) {
        _UserActions2.default.followUserSuccess(user);
        _this2.setState(function (prevstate) {
          return { change: !prevstate.change };
        });
      });
    }
  }, {
    key: 'unfollowUser',
    value: function unfollowUser(e) {
      var _this3 = this;

      e.preventDefault();

      var request = _DataRequests2.default.post('/api/user/unfollow/' + this.props.userId, {}, true);

      $.ajax(request).done(function (user) {
        _UserActions2.default.followUserSuccess(user);
        _this3.setState(function (prevstate) {
          return { change: !prevstate.change };
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (_Auth2.default.getUser()._id === this.props.userId) {
        return _react2.default.createElement('div', null);
      }

      var followBtn = void 0;

      if (this.isAlreadyFollowed()) {
        followBtn = _react2.default.createElement(
          'a',
          { onClick: this.unfollowUser.bind(this), className: 'btn btn-warning' },
          'Unfollow User'
        );
      } else {
        followBtn = _react2.default.createElement(
          'a',
          { onClick: this.followUser.bind(this), className: 'btn btn-warning' },
          'Follow User'
        );
      }

      return _react2.default.createElement(
        'div',
        null,
        followBtn
      );
    }
  }]);

  return UserFollow;
}(_react.Component);

exports.default = UserFollow;

},{"../../../DataRequests":70,"../../../actions/UserActions":81,"../../Auth":88,"react":"react"}],124:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _UserFollow = require('./UserFollow');

var _UserFollow2 = _interopRequireDefault(_UserFollow);

var _reactRouterDom = require('react-router-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserInfo = function (_React$Component) {
  _inherits(UserInfo, _React$Component);

  function UserInfo() {
    _classCallCheck(this, UserInfo);

    return _possibleConstructorReturn(this, (UserInfo.__proto__ || Object.getPrototypeOf(UserInfo)).apply(this, arguments));
  }

  _createClass(UserInfo, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'container profile-container' },
        _react2.default.createElement(
          'div',
          { className: 'profile-img' },
          _react2.default.createElement('img', { src: this.props.profile.userProfilePicture })
        ),
        _react2.default.createElement(
          'div',
          { className: 'profile-info clearfix' },
          _react2.default.createElement(
            'h2',
            null,
            _react2.default.createElement(
              'strong',
              null,
              'First Name: ',
              this.props.profile.userFirstName
            )
          ),
          _react2.default.createElement(
            'h2',
            null,
            _react2.default.createElement(
              'strong',
              null,
              'Last Name: ',
              this.props.profile.userLastName
            )
          ),
          _react2.default.createElement(
            'h2',
            null,
            _react2.default.createElement(
              'strong',
              null,
              'Gender: ',
              this.props.profile.userGender
            )
          ),
          _react2.default.createElement(
            'h2',
            null,
            _react2.default.createElement(
              'strong',
              null,
              'Username: ',
              this.props.profile.userUsername
            )
          ),
          _react2.default.createElement(
            'h2',
            null,
            _react2.default.createElement(
              'strong',
              null,
              'Age: ',
              this.props.profile.userAge
            )
          ),
          _react2.default.createElement(
            'h4',
            { className: 'lead' },
            _react2.default.createElement(
              _reactRouterDom.Link,
              { className: 'label', to: '/user/block' },
              'Block user'
            )
          ),
          _react2.default.createElement(_UserFollow2.default, { userId: this.props.profile._id })
        )
      );
    }
  }]);

  return UserInfo;
}(_react2.default.Component);

exports.default = UserInfo;

},{"./UserFollow":123,"react":"react","react-router-dom":57}],125:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _UserPostsPanel = require('./UserPostsPanel');

var _UserPostsPanel2 = _interopRequireDefault(_UserPostsPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserPosts = function (_React$Component) {
  _inherits(UserPosts, _React$Component);

  function UserPosts(props) {
    _classCallCheck(this, UserPosts);

    var _this = _possibleConstructorReturn(this, (UserPosts.__proto__ || Object.getPrototypeOf(UserPosts)).call(this, props));

    _this.state = {
      showPostsPanel: false
    };
    return _this;
  }

  _createClass(UserPosts, [{
    key: 'togglePosts',
    value: function togglePosts() {
      this.setState(function (prevState) {
        return {
          showPostsPanel: !prevState.showPostsPanel
        };
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'container profile-container' },
        _react2.default.createElement(
          'div',
          { className: 'profile-stats clearfix' },
          _react2.default.createElement(
            'ul',
            null,
            _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                'span',
                { className: 'stats-number' },
                this.props.posts ? this.props.posts.length : 0
              ),
              'Posts'
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'pull-right btn-group' },
          _react2.default.createElement(
            'a',
            { className: 'btn btn-primary', onClick: this.togglePosts.bind(this) },
            this.state.showPostsPanel ? 'Hide' : 'Show User Posts'
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'user-posts' },
          this.state.showPostsPanel ? _react2.default.createElement(_UserPostsPanel2.default, { posts: this.props.posts, getUserPost: this.props.getUserPosts }) : null
        )
      );
    }
  }]);

  return UserPosts;
}(_react2.default.Component);

exports.default = UserPosts;

},{"./UserPostsPanel":126,"react":"react"}],126:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PostCard = require('../PostCard');

var _PostCard2 = _interopRequireDefault(_PostCard);

var _Helpers = require('../../../utilities/Helpers');

var _Helpers2 = _interopRequireDefault(_Helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserPostsPanel = function (_React$Component) {
  _inherits(UserPostsPanel, _React$Component);

  function UserPostsPanel() {
    _classCallCheck(this, UserPostsPanel);

    return _possibleConstructorReturn(this, (UserPostsPanel.__proto__ || Object.getPrototypeOf(UserPostsPanel)).apply(this, arguments));
  }

  _createClass(UserPostsPanel, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var posts = this.props.posts.map(function (post, index) {
        var postId = post._id;

        var likeRequest = '/api/post/like/' + postId;
        var unlikeRequest = '/api/post/unlike/' + postId;

        return _react2.default.createElement(_PostCard2.default, {
          key: post._id,
          index: index,
          post: post,
          likePost: _Helpers2.default.likePost.bind(_this2, likeRequest, _this2.props.getUserPost),
          unlikePost: _Helpers2.default.unlikePost.bind(_this2, unlikeRequest, _this2.props.getUserPost)
        });
      });

      return _react2.default.createElement(
        'div',
        null,
        posts
      );
    }
  }]);

  return UserPostsPanel;
}(_react2.default.Component);

exports.default = UserPostsPanel;

},{"../../../utilities/Helpers":144,"../PostCard":118,"react":"react"}],127:[function(require,module,exports){
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _App = require('./components/App');

var _App2 = _interopRequireDefault(_App);

var _createBrowserHistory = require('history/lib/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var history = (0, _createBrowserHistory2.default)();

_reactDom2.default.render(_react2.default.createElement(
  _reactRouterDom.BrowserRouter,
  null,
  _react2.default.createElement(_App2.default, { history: history })
), document.getElementById('app'));

},{"./components/App":87,"history/lib/createBrowserHistory":24,"react":"react","react-dom":"react-dom","react-router-dom":57}],128:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _Home = require('./components/Home');

var _Home2 = _interopRequireDefault(_Home);

var _UserProfile = require('./components/UserProfile');

var _UserProfile2 = _interopRequireDefault(_UserProfile);

var _UserLogin = require('./components/UserLogin');

var _UserLogin2 = _interopRequireDefault(_UserLogin);

var _UserRegister = require('./components/UserRegister');

var _UserRegister2 = _interopRequireDefault(_UserRegister);

var _PostAdd = require('./components/post/PostAdd');

var _PostAdd2 = _interopRequireDefault(_PostAdd);

var _PostEdit = require('./components/post/PostEdit');

var _PostEdit2 = _interopRequireDefault(_PostEdit);

var _PostDelete = require('./components/post/PostDelete');

var _PostDelete2 = _interopRequireDefault(_PostDelete);

var _BlockUser = require('./components/BlockUser');

var _BlockUser2 = _interopRequireDefault(_BlockUser);

var _PostComment = require('./components/post/comments/PostComment');

var _PostComment2 = _interopRequireDefault(_PostComment);

var _AdminPanel = require('./components/AdminPanel');

var _AdminPanel2 = _interopRequireDefault(_AdminPanel);

var _ProfilePictureAdd = require('./components/ProfilePictureAdd');

var _ProfilePictureAdd2 = _interopRequireDefault(_ProfilePictureAdd);

var _EditComment = require('./components/post/comments/EditComment');

var _EditComment2 = _interopRequireDefault(_EditComment);

var _DeleteComment = require('./components/post/comments/DeleteComment');

var _DeleteComment2 = _interopRequireDefault(_DeleteComment);

var _Messenger = require('./components/messanger/Messenger');

var _Messenger2 = _interopRequireDefault(_Messenger);

var _MessageThread = require('./components/messanger/MessageThread');

var _MessageThread2 = _interopRequireDefault(_MessageThread);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Routes = function Routes(history) {
  return _react2.default.createElement(
    _reactRouterDom.Switch,
    null,
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/', component: _Home2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { path: '/user/profile/:userId', component: _UserProfile2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/user/login', component: _UserLogin2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/user/register', component: _UserRegister2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/post/comment/:postId', component: _PostComment2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/post/add', component: _PostAdd2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/post/edit/:postId', component: _PostEdit2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/post/delete/:postId', component: _PostDelete2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/user/block', component: _BlockUser2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/user/admin-panel', component: _AdminPanel2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: '/user/profile-picture/:userId', component: _ProfilePictureAdd2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { path: '/comment/edit/:id', component: _EditComment2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { path: '/comment/delete/:id', component: _DeleteComment2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { path: '/messenger', component: _Messenger2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { path: '/thread/:otherUserUsername', component: _MessageThread2.default }),
    _react2.default.createElement(_reactRouterDom.Route, { component: _Home2.default })
  );
};

exports.default = Routes;

},{"./components/AdminPanel":86,"./components/BlockUser":89,"./components/Home":91,"./components/ProfilePictureAdd":93,"./components/UserLogin":94,"./components/UserProfile":95,"./components/UserRegister":96,"./components/messanger/MessageThread":104,"./components/messanger/Messenger":106,"./components/post/PostAdd":107,"./components/post/PostDelete":108,"./components/post/PostEdit":109,"./components/post/comments/DeleteComment":111,"./components/post/comments/EditComment":112,"./components/post/comments/PostComment":113,"react":"react","react-router-dom":57}],129:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AdminPanelActions = require('../actions/AdminPanelActions');

var _AdminPanelActions2 = _interopRequireDefault(_AdminPanelActions);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdminPanelStore = function () {
  function AdminPanelStore() {
    _classCallCheck(this, AdminPanelStore);

    this.bindActions(_AdminPanelActions2.default);

    this.admins = [];
    this.userForAdmin = '';
    this.contentValidationState = '';
    this.message = '';
    this.formSubmitState = '';
  }

  _createClass(AdminPanelStore, [{
    key: 'onGetAdminsFail',
    value: function onGetAdminsFail(err) {
      console.log('Failed to load admins', err);
    }
  }, {
    key: 'onGetAdminsSuccess',
    value: function onGetAdminsSuccess(data) {
      this.admins = data;
      console.log(data);
    }
  }, {
    key: 'onMakeAdminSuccess',
    value: function onMakeAdminSuccess(post) {
      console.log('Added post');
      this.userForAdmin = '';
      this.contentValidationState = '';
      this.message = 'Admin added';
      this.formSubmitState = '';
    }
  }, {
    key: 'onMakeAdminFail',
    value: function onMakeAdminFail(err) {
      console.log('Failed to add admin', err);
    }
  }, {
    key: 'onHandleContentChange',
    value: function onHandleContentChange(e) {
      this.userForAdmin = e.target.value;
      this.helpBlock = '';
    }
  }, {
    key: 'onContentValidationFail',
    value: function onContentValidationFail() {
      this.contentValidationState = 'has-error';
      this.message = 'Enter username';
      this.formSubmitState = '';
    }
  }, {
    key: 'onLoadAdminPanelForm',
    value: function onLoadAdminPanelForm() {
      this.userForAdmin = '';
      this.contentValidationState = '';
      this.message = '';
      this.formSubmitState = '';
    }
  }]);

  return AdminPanelStore;
}();

exports.default = _alt2.default.createStore(AdminPanelStore);

},{"../actions/AdminPanelActions":71,"../alt":85}],130:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BlockUserActions = require('../actions/BlockUserActions');

var _BlockUserActions2 = _interopRequireDefault(_BlockUserActions);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlockUserStore = function () {
  function BlockUserStore() {
    _classCallCheck(this, BlockUserStore);

    this.bindActions(_BlockUserActions2.default);

    this.content = '';
    this.contentValidationState = '';
    this.message = '';
    this.formSubmitState = '';
  }

  _createClass(BlockUserStore, [{
    key: 'onBlockYourProfileError',
    value: function onBlockYourProfileError() {
      this.contentValidationState = 'has-error';
      this.message = "You cannot block your profile";
      this.formSubmitState = '';
    }
  }, {
    key: 'onBlockUserSuccess',
    value: function onBlockUserSuccess() {
      this.content = '';
      this.contentValidationState = '';
      this.message = 'User blocked';
      this.formSubmitState = '';
    }
  }, {
    key: 'onHandleContentChange',
    value: function onHandleContentChange(e) {
      this.content = e.target.value;
    }
  }, {
    key: 'onUserNotExist',
    value: function onUserNotExist() {
      this.contentValidationState = 'has-error';
      this.message = "This user doesn't exist";
      this.formSubmitState = '';
    }
  }, {
    key: 'onBlockUserWhoIsBlockedError',
    value: function onBlockUserWhoIsBlockedError() {
      this.contentValidationState = 'has-error';
      this.message = 'This user is blocked';
      this.formSubmitState = '';
    }
  }, {
    key: 'onContentValidationFail',
    value: function onContentValidationFail() {
      this.contentValidationState = 'has-error';
      this.message = 'Enter username of user who want to block';
      this.formSubmitState = '';
    }
  }, {
    key: 'onLoadBlockUserForm',
    value: function onLoadBlockUserForm() {
      this.content = '';
      this.contentValidationState = '';
      this.message = '';
      this.formSubmitState = '';
    }
  }]);

  return BlockUserStore;
}();

exports.default = _alt2.default.createStore(BlockUserStore);

},{"../actions/BlockUserActions":72,"../alt":85}],131:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _FooterActions = require('../actions/FooterActions');

var _FooterActions2 = _interopRequireDefault(_FooterActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FooterStore = function FooterStore() {
  _classCallCheck(this, FooterStore);

  this.bindActions(_FooterActions2.default);
};

exports.default = _alt2.default.createStore(FooterStore);

},{"../actions/FooterActions":73,"../alt":85}],132:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _FormActions = require('../actions/FormActions');

var _FormActions2 = _interopRequireDefault(_FormActions);

var _UserActions = require('../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormStore = function () {
  function FormStore() {
    _classCallCheck(this, FormStore);

    this.bindActions(_FormActions2.default);
    this.bindListeners({
      onRegisterUserFail: _UserActions2.default.registerUserFail,
      onRegisterUserSuccess: _UserActions2.default.registerUserSuccess,
      onLoginUserSuccess: _UserActions2.default.loginUserSuccess,
      onLoginUserFail: _UserActions2.default.loginUserFail,
      onLogoutUserSuccess: _UserActions2.default.logoutUserSuccess
    });

    this.username = '';
    this.password = '';
    this.confirmedPassword = '';
    this.firstName = '';
    this.lastName = '';
    this.age = '';
    this.gender = '';
    this.formSubmitState = '';
    this.usernameValidationState = '';
    this.passwordValidationState = '';
    this.message = '';
  }

  _createClass(FormStore, [{
    key: 'onRegisterUserSuccess',
    value: function onRegisterUserSuccess() {
      console.log('FormStore register success');

      this.formSubmitState = 'has-success';
      this.username = '';
      this.usernameValidationState = '';
      this.passwordValidationState = '';
      this.message = 'User register success';
    }
  }, {
    key: 'onRegisterUserFail',
    value: function onRegisterUserFail(err) {
      console.log('FormStore register fail', err);
      if (err.code === 11000) {
        this.usernameValidationState = 'has-error';
        this.message = 'Username already in use';
        return;
      }

      this.formSubmitState = 'has-error';
      this.message = err.errmsg;
    }
  }, {
    key: 'onUsernameValidatonFail',
    value: function onUsernameValidatonFail() {
      this.usernameValidationState = 'has-error';
      this.passwordValidationState = '';
      this.formSubmitState = '';
      this.message = 'Enter username';
    }
  }, {
    key: 'onPasswordValidationFail',
    value: function onPasswordValidationFail() {
      this.passwordValidationState = 'has-error';
      this.usernameValidationState = '';
      this.formSubmitState = '';
      this.message = 'Invalid password, or password doest not match';
    }
  }, {
    key: 'onHandleUsernameChange',
    value: function onHandleUsernameChange(e) {
      this.username = e.target.value;
    }
  }, {
    key: 'onHandlePasswordChange',
    value: function onHandlePasswordChange(e) {
      this.password = e.target.value;
    }
  }, {
    key: 'onHandleConfirmedPasswordChange',
    value: function onHandleConfirmedPasswordChange(e) {
      this.confirmedPassword = e.target.value;
    }
  }, {
    key: 'onHandleFirstNameChange',
    value: function onHandleFirstNameChange(e) {
      this.firstName = e.target.value;
    }
  }, {
    key: 'onHandleLastNameChange',
    value: function onHandleLastNameChange(e) {
      this.lastName = e.target.value;
    }
  }, {
    key: 'onHandleAgeChange',
    value: function onHandleAgeChange(e) {
      this.age = e.target.value;
    }
  }, {
    key: 'onHandleGenderChange',
    value: function onHandleGenderChange(e) {
      this.gender = e.target.value;
    }
  }, {
    key: 'onLoginUserSuccess',
    value: function onLoginUserSuccess() {
      this.formSubmitState = 'has-success';
      this.usernameValidationState = '';
      this.passwordValidationState = '';
      this.message = 'User login successful';
    }
  }, {
    key: 'onLoginUserFail',
    value: function onLoginUserFail(err) {
      this.formSubmitState = 'has-error';
      this.usernameValidationState = 'has-error';
      this.passwordValidationState = 'has-error';
      this.message = err.message;
    }
  }, {
    key: 'onUnauthorizedAccessAttempt',
    value: function onUnauthorizedAccessAttempt() {
      this.formSubmitState = 'has-error';
      this.usernameValidationState = '';
      this.passwordValidationState = '';
      this.message = 'Please login';
    }
  }, {
    key: 'onLogoutUserSuccess',
    value: function onLogoutUserSuccess() {
      this.formSubmitState = '';
      this.usernameValidationState = '';
      this.passwordValidationState = '';
      this.message = '';
    }
  }]);

  return FormStore;
}();

exports.default = _alt2.default.createStore(FormStore);

},{"../actions/FormActions":74,"../actions/UserActions":81,"../alt":85}],133:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _HomeActions = require('../actions/HomeActions');

var _HomeActions2 = _interopRequireDefault(_HomeActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HomeStore = function () {
  function HomeStore() {
    _classCallCheck(this, HomeStore);

    this.bindActions(_HomeActions2.default);

    this.posts = [];
    this.pageCount = 0;
    this.offset = 0;
    this.postsToDisplay = [];
  }

  _createClass(HomeStore, [{
    key: 'onGetUserPostsSuccess',
    value: function onGetUserPostsSuccess(data) {
      this.posts = data;
      this.pageCount = data.length / 10;
      this.postsToDisplay = this.posts.slice(this.offset, this.offset + 10);
    }
  }, {
    key: 'onRemovePostsSuccess',
    value: function onRemovePostsSuccess() {
      this.posts = [];
    }
  }, {
    key: 'onHandlePageChange',
    value: function onHandlePageChange(offset) {
      this.offset = offset;
      this.postsToDisplay = this.posts.slice(offset, offset + 10);
    }
  }]);

  return HomeStore;
}();

exports.default = _alt2.default.createStore(HomeStore);

},{"../actions/HomeActions":75,"../alt":85}],134:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _NavbarActions = require('../actions/NavbarActions');

var _NavbarActions2 = _interopRequireDefault(_NavbarActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavbarStore = function () {
  function NavbarStore() {
    _classCallCheck(this, NavbarStore);

    this.bindActions(_NavbarActions2.default);
    this.ajaxAnimationClass = '';
  }

  _createClass(NavbarStore, [{
    key: 'onUpdateAjaxAnimation',
    value: function onUpdateAjaxAnimation(animationClass) {
      this.ajaxAnimationClass = animationClass;
    }
  }]);

  return NavbarStore;
}();

exports.default = _alt2.default.createStore(NavbarStore);

},{"../actions/NavbarActions":77,"../alt":85}],135:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PostDeleteActions = require('../actions/PostDeleteActions');

var _PostDeleteActions2 = _interopRequireDefault(_PostDeleteActions);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostDeleteStore = function () {
  function PostDeleteStore() {
    _classCallCheck(this, PostDeleteStore);

    this.bindActions(_PostDeleteActions2.default);

    this.author = '';
    this.content = '';
    this.message = '';
  }

  _createClass(PostDeleteStore, [{
    key: 'onGetDeletePostInfoSuccess',
    value: function onGetDeletePostInfoSuccess(data) {
      this.message = '';
      this.content = data.content;
    }
  }, {
    key: 'onGetDeletePostInfoFail',
    value: function onGetDeletePostInfoFail(err) {
      this.message = 'Failed to load info';
      console.log('Failed to load info', err);
    }
  }, {
    key: 'onDeletePostSuccess',
    value: function onDeletePostSuccess(post) {
      console.log('Post deleted');
      this.message = 'Post deleted';
      this.content = '';
    }
  }, {
    key: 'onDeletePostFail',
    value: function onDeletePostFail(err) {
      console.log('Failed to edit post', err);
    }
  }]);

  return PostDeleteStore;
}();

exports.default = _alt2.default.createStore(PostDeleteStore);

},{"../actions/PostDeleteActions":78,"../alt":85}],136:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ProfilePictureAddActions = require('../actions/ProfilePictureAddActions');

var _ProfilePictureAddActions2 = _interopRequireDefault(_ProfilePictureAddActions);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProfilePictureAddStore = function () {
  function ProfilePictureAddStore() {
    _classCallCheck(this, ProfilePictureAddStore);

    this.bindActions(_ProfilePictureAddActions2.default);

    this.author = '';
    this.image = '';
    this.contentValidationState = '';
    this.message = '';
    this.formSubmitState = '';
  }

  _createClass(ProfilePictureAddStore, [{
    key: 'onAddProfilePictureSuccess',
    value: function onAddProfilePictureSuccess(data) {
      this.message = 'Profile picture added';
      this.image = '';
    }
  }, {
    key: 'onAddProfilePictureFail',
    value: function onAddProfilePictureFail(err) {
      this.message = 'Failed to add profile picture';
      console.log('Failed to add profile picture', err);
    }
  }, {
    key: 'onHandleContentChange',
    value: function onHandleContentChange(e) {
      this.image = e.target.files[0];
      this.helpBlock = '';
    }
  }, {
    key: 'onContentValidationFail',
    value: function onContentValidationFail() {
      this.contentValidationState = 'has-error';
      this.message = 'Attach an image file';
      this.formSubmitState = '';
    }
  }]);

  return ProfilePictureAddStore;
}();

exports.default = _alt2.default.createStore(ProfilePictureAddStore);

},{"../actions/ProfilePictureAddActions":79,"../alt":85}],137:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SearchBarActions = require('../actions/SearchBarActions');

var _SearchBarActions2 = _interopRequireDefault(_SearchBarActions);

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchBarStore = function () {
    function SearchBarStore() {
        _classCallCheck(this, SearchBarStore);

        this.bindActions(_SearchBarActions2.default);

        this.content = '';
    }

    _createClass(SearchBarStore, [{
        key: 'onHandleContentChange',
        value: function onHandleContentChange(e) {
            this.content = e.target.value;
        }
    }, {
        key: 'onLoadSearchBarForm',
        value: function onLoadSearchBarForm() {
            this.content = '';
        }
    }]);

    return SearchBarStore;
}();

exports.default = _alt2.default.createStore(SearchBarStore);

},{"../actions/SearchBarActions":80,"../alt":85}],138:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

var _Auth = require('../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _UserActions = require('../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserStore = function () {
  function UserStore() {
    _classCallCheck(this, UserStore);

    this.bindActions(_UserActions2.default);

    this._id = '';
    this.username = '';
    this.roles = [];
    this.userPosts = [];
    this.profile = {
      _id: '',
      userUsername: '',
      userAge: '',
      userFirstName: '',
      userLastName: '',
      userGender: '',
      userProfilePicture: ''
    };
  }

  _createClass(UserStore, [{
    key: 'onRegisterUserSuccess',
    value: function onRegisterUserSuccess(responseData) {
      var user = responseData.user;
      this.username = user.username;
      this.roles = user.roles;
      _Auth2.default.authenticateUser(responseData.token);
      _Auth2.default.saveUser(user);
    }
  }, {
    key: 'onLoginUserSuccess',
    value: function onLoginUserSuccess(responseData) {
      var user = responseData.user;
      this.username = user.username;
      this.roles = user.roles;
      _Auth2.default.authenticateUser(responseData.token);
      _Auth2.default.saveUser(user);
    }
  }, {
    key: 'onLoginUserFail',
    value: function onLoginUserFail() {
      console.log('Failed loggin attempt');
    }
  }, {
    key: 'onLogoutUserSuccess',
    value: function onLogoutUserSuccess() {
      this.username = '';
      this.roles = [];
      this.userPosts = [];
      _Auth2.default.deauthenticateUser();
      _Auth2.default.removeUser();
    }
  }, {
    key: 'onGetUserOwnPostsSuccess',
    value: function onGetUserOwnPostsSuccess(posts) {
      this.userPosts = posts;
    }
  }, {
    key: 'onGetUserOwnPostsFail',
    value: function onGetUserOwnPostsFail() {
      console.log('Couldn\'t get user own posts. Problem with the DB');
    }
  }, {
    key: 'onGetProfileInfoSuccess',
    value: function onGetProfileInfoSuccess(user) {
      this.profile._id = user._id;
      this.profile.userUsername = user.username;
      this.profile.userAge = user.age;
      this.profile.userFirstName = user.firstName;
      this.profile.userLastName = user.lastName;
      this.profile.userGender = user.gender;
      this.profile.userProfilePicture = user.profilePicture;
    }
  }, {
    key: 'onFollowUserSuccess',
    value: function onFollowUserSuccess(user) {
      _Auth2.default.saveUser(user);
    }
  }]);

  return UserStore;
}();

exports.default = _alt2.default.createStore(UserStore);

},{"../actions/UserActions":81,"../alt":85,"../components/Auth":88}],139:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _MessageActions = require('../../actions/MessageActions');

var _MessageActions2 = _interopRequireDefault(_MessageActions);

var _UserActions = require('../../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageThreadStore = function () {
  function MessageThreadStore() {
    _classCallCheck(this, MessageThreadStore);

    this.bindActions(_MessageActions2.default);
    this.messages = [];
    this.threadId = '';
  }

  _createClass(MessageThreadStore, [{
    key: 'onSendMessageSuccess',
    value: function onSendMessageSuccess(thread) {
      this.messages = thread.messages;
      this.threadId = thread._id;
    }
  }, {
    key: 'onGetThreadMessagesSuccess',
    value: function onGetThreadMessagesSuccess(thread) {
      this.messages = thread.messages;
      this.threadId = thread._id;
    }
  }, {
    key: 'onGetThreadMessagesFail',
    value: function onGetThreadMessagesFail() {
      console.log('Failed loading messages');
    }
  }]);

  return MessageThreadStore;
}();

exports.default = _alt2.default.createStore(MessageThreadStore);

},{"../../actions/MessageActions":76,"../../actions/UserActions":81,"../../alt":85,"../../components/Auth":88}],140:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

var _Auth = require('../../components/Auth');

var _Auth2 = _interopRequireDefault(_Auth);

var _MessageActions = require('../../actions/MessageActions');

var _MessageActions2 = _interopRequireDefault(_MessageActions);

var _UserActions = require('../../actions/UserActions');

var _UserActions2 = _interopRequireDefault(_UserActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageStore = function () {
  function MessageStore() {
    _classCallCheck(this, MessageStore);

    this.bindActions(_MessageActions2.default);
    this.bindListeners({
      onGetUserThreadsSuccess: _UserActions2.default.getUserThreadsSuccess,
      onGetUserThreadsFail: _UserActions2.default.getUserThreadsFail
    });

    this.userThreads = [];
  }

  _createClass(MessageStore, [{
    key: 'onGetUserThreadsSuccess',
    value: function onGetUserThreadsSuccess(threads) {
      this.userThreads = threads;
    }
  }, {
    key: 'onGetUserThreadsFail',
    value: function onGetUserThreadsFail() {
      console.log('Failed loading user\'s threads');
    }
  }]);

  return MessageStore;
}();

exports.default = _alt2.default.createStore(MessageStore);

},{"../../actions/MessageActions":76,"../../actions/UserActions":81,"../../alt":85,"../../components/Auth":88}],141:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PostAddActions = require('../../actions/post-actions/PostAddActions');

var _PostAddActions2 = _interopRequireDefault(_PostAddActions);

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostAddStore = function () {
  function PostAddStore() {
    _classCallCheck(this, PostAddStore);

    this.bindActions(_PostAddActions2.default);

    this.author = '';
    this.content = '';
    this.contentValidationState = '';
    this.message = '';
    this.formSubmitState = '';
  }

  _createClass(PostAddStore, [{
    key: 'onAddPostSuccess',
    value: function onAddPostSuccess(post) {
      console.log('Added post');
      this.content = '';
      this.contentValidationState = '';
      this.message = 'Post added';
      this.formSubmitState = '';
    }
  }, {
    key: 'onAddPostFail',
    value: function onAddPostFail(err) {
      console.log('Failed to add post', err);
    }
  }, {
    key: 'onHandleContentChange',
    value: function onHandleContentChange(e) {
      this.content = e.target.value;
      this.helpBlock = '';
    }
  }, {
    key: 'onContentValidationFail',
    value: function onContentValidationFail() {
      this.contentValidationState = 'has-error';
      this.message = 'Enter post content';
      this.formSubmitState = '';
    }
  }, {
    key: 'onLoadPostAddForm',
    value: function onLoadPostAddForm() {
      this.content = '';
      this.contentValidationState = '';
      this.message = '';
      this.formSubmitState = '';
    }
  }]);

  return PostAddStore;
}();

exports.default = _alt2.default.createStore(PostAddStore);

},{"../../actions/post-actions/PostAddActions":82,"../../alt":85}],142:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

var _PostCommentActions = require('../../actions/post-actions/PostCommentActions');

var _PostCommentActions2 = _interopRequireDefault(_PostCommentActions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostCommentStore = function () {
  function PostCommentStore() {
    _classCallCheck(this, PostCommentStore);

    this.bindActions(_PostCommentActions2.default);

    this.comments = [];
    this.comment = '';
    this.formSubmitState = '';
    this.message = '';
    this.post = {
      content: '',
      likes: []
    };

    this.editCommentFormSubmitState = '';
    this.editCommentMessage = '';
    this.editContent = '';
    this.editCommentContentValidationState = '';
    this.redirect = false;

    this.deleteCommentMessage = '';
  }

  _createClass(PostCommentStore, [{
    key: 'onCommentValidationFail',
    value: function onCommentValidationFail() {
      this.message = 'Comment can\'t be empty!';
      this.formSubmitState = 'has-error';
    }
  }, {
    key: 'onHandleCommentChange',
    value: function onHandleCommentChange(e) {
      this.comment = e.target.value;
      this.message = '';
    }
  }, {
    key: 'onAddCommentSuccess',
    value: function onAddCommentSuccess() {
      this.comment = '';
      this.message = 'Comment added';
    }
  }, {
    key: 'onGetPostInfoSuccess',
    value: function onGetPostInfoSuccess(post) {
      this.post = post;
      this.comments = post.comments;
    }
  }, {
    key: 'onGetCommentInfoSuccess',
    value: function onGetCommentInfoSuccess(comment) {
      this.redirect = false;
      this.comment = '';
      this.message = '';
      this.contentValidationState = '';

      this.deleteCommentMessage = '';
      this.deleteCommentMessage = '';

      this.formSubmitState = '';
      this.editContent = comment.content;
    }
  }, {
    key: 'onHandleEditCommentChange',
    value: function onHandleEditCommentChange(e) {
      this.editContent = e.target.value;
    }
  }, {
    key: 'onEditContentValidationFail',
    value: function onEditContentValidationFail() {
      this.redirect = false;
      this.contentValidationState = 'has-error';
      this.message = 'Enter comment content';
      this.formSubmitState = '';
    }
  }, {
    key: 'onEditCommentValidationFail',
    value: function onEditCommentValidationFail() {
      this.editCommentFormSubmitState = 'has-error';
      this.editCommentMessage = 'Comment can\'t be empty.';
    }
  }, {
    key: 'onEditCommentSuccess',
    value: function onEditCommentSuccess(post) {
      this.redirect = true;
      this.editContent = '';
      this.editCommentContentValidationState = '';
      this.editCommentMessage = 'Post edited';
      this.editCommentFormSubmitState = '';
    }
  }, {
    key: 'onEditCommentFail',
    value: function onEditCommentFail(err) {
      this.redirect = false;
      this.editCommentFormSubmitState = 'has-error';
      console.log('Failed to edit comment', err);
    }
  }, {
    key: 'onDeleteCommentSuccess',
    value: function onDeleteCommentSuccess() {
      this.deleteCommentMessage = 'Comment deleted';
      this.redirect = true;
    }
  }, {
    key: 'onDeleteCommentFail',
    value: function onDeleteCommentFail() {
      this.deleteCommentMessage = 'Delete failed';
      this.redirect = false;
    }
  }, {
    key: 'onClearRedirectSuccess',
    value: function onClearRedirectSuccess() {
      this.redirect = false;
    }
  }]);

  return PostCommentStore;
}();

exports.default = _alt2.default.createStore(PostCommentStore);

},{"../../actions/post-actions/PostCommentActions":83,"../../alt":85}],143:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PostEditActions = require('../../actions/post-actions/PostEditActions');

var _PostEditActions2 = _interopRequireDefault(_PostEditActions);

var _alt = require('../../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PostEditStore = function () {
  function PostEditStore() {
    _classCallCheck(this, PostEditStore);

    this.bindActions(_PostEditActions2.default);

    this.author = '';
    this.content = '';
    this.contentValidationState = '';
    this.message = '';
    this.formSubmitState = '';
  }

  _createClass(PostEditStore, [{
    key: 'onGetEditPostInfoSuccess',
    value: function onGetEditPostInfoSuccess(data) {
      this.message = '';
      this.content = data.content;
    }
  }, {
    key: 'onGetEditPostInfoFail',
    value: function onGetEditPostInfoFail(err) {
      this.message = 'Failed to load edit info';
      console.log('Failed to load edit info', err);
    }
  }, {
    key: 'onEditPostSuccess',
    value: function onEditPostSuccess(post) {
      console.log('Post edited');
      this.contentValidationState = '';
      this.message = 'Post edited';
      this.formSubmitState = '';
    }
  }, {
    key: 'onEditPostFail',
    value: function onEditPostFail(err) {
      console.log('Failed to edit post', err);
    }
  }, {
    key: 'onHandleContentChange',
    value: function onHandleContentChange(e) {
      this.content = e.target.value;
      this.helpBlock = '';
    }
  }, {
    key: 'onContentValidationFail',
    value: function onContentValidationFail() {
      this.contentValidationState = 'has-error';
      this.message = 'Enter post content';
      this.formSubmitState = '';
    }
  }]);

  return PostEditStore;
}();

exports.default = _alt2.default.createStore(PostEditStore);

},{"../../actions/post-actions/PostEditActions":84,"../../alt":85}],144:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DataRequests = require('../DataRequests');

var _DataRequests2 = _interopRequireDefault(_DataRequests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Helpers = function () {
  function Helpers() {
    _classCallCheck(this, Helpers);
  }

  _createClass(Helpers, null, [{
    key: 'appendToArray',
    value: function appendToArray(value, array) {
      array.push(value);
      return array;
    }
  }, {
    key: 'prependToArray',
    value: function prependToArray(value, array) {
      array.unshift(value);
      return array;
    }
  }, {
    key: 'removeFromArray',
    value: function removeFromArray(value, array) {
      var index = array.indexOf(value);
      if (index !== -1) {
        array.splice(index, 1);
      }
      return array;
    }
  }, {
    key: 'likePost',
    value: function likePost(request, updateFunction) {
      request = _DataRequests2.default.post(request, {}, true);
      $.ajax(request).done(function () {
        return updateFunction();
      }).fail(function (err) {
        return console.log(err);
      });
    }
  }, {
    key: 'unlikePost',
    value: function unlikePost(request, updateFunction) {
      request = _DataRequests2.default.post(request, {}, true);
      $.ajax(request).done(function () {
        return updateFunction();
      }).fail(function (err) {
        return console.log(err);
      });
    }
  }]);

  return Helpers;
}();

exports.default = Helpers;

},{"../DataRequests":70}]},{},[127])

//# sourceMappingURL=bundle.js.map
