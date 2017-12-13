/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
    // all typechecks must always return a boolean value.
    var isDefined = function isDefined(value) {
        return value !== undefined;
    };

    var isNull = function isNull(value) {
        return value === null;
    };

    var isArray = function isArray(value) {
        return Array.isArray(value);
    };

    var isFunction = function isFunction(value) {
        return typeof value === 'function';
    };

    var isString = function isString(value) {
        return typeof value === 'string';
    };

    var isNumber = function isNumber(value) {
        return typeof value === 'number';
    };

    var isBoolean = function isBoolean(value) {
        return typeof value === 'boolean';
    };

    var isObject = function isObject(value) {
        return !!value && value.constructor === Object;
    };

    var isNode = function isNode(value) {
        return !!(value && value.tagName && value.nodeName && value.ownerDocument && value.removeAttribute);
    };

    var isRegExp = function isRegExp(value) {
        return value instanceof RegExp;
    };

    // there cannot be any assumptions about the environment globals so
    // node's process should not be used.
    var isBrowser = function isBrowser() {
        return typeof window !== 'undefined';
    };

    var deepCopy = function deepCopy(obj) {
        // undefined value would otherwise throw an error at parsing time.
        if (!isDefined(obj)) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    };

    // internal function that wraps JSON.stringify
    var prettyPrint = function prettyPrint(obj) {
        // uses a custom replacer to correctly handle functions
        var stringified = JSON.stringify(obj, function (key, value) {
            return typeof value === 'function' ? value.toString() : value;
        }, 2);

        // stringified value is passed through the String constructor to
        // correct for the "undefined" case. each line is then indented.
        var indented = String(stringified).replace(/\n/g, '\n    ');

        return '\n>>> ' + indented;
    };

    // will throw an error containing the message and the culprits if the
    // assertion is falsy. the message is expected to contain information
    // about the location of the error followed by a meaningful error message.
    // (ex. "router.redirect : url is not a string")
    var assert = function assert(assertion, message) {
        for (var _len = arguments.length, culprits = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            culprits[_key - 2] = arguments[_key];
        }

        if (!assertion) {
            throw new Error('@okwolo.' + message + culprits.map(prettyPrint).join(''));
        }
    };

    // this function will create a queue object which can be used to defer
    // the execution of functions.
    var makeQueue = function makeQueue() {
        var queue = [];

        // runs the first function in the queue if it exists. this specifically
        // does not call done or remove the function from the queue since there
        // is no knowledge about whether or not the function has completed. this
        // means that the queue will wait for a done signal before running any
        // other element.
        var run = function run() {
            var func = queue[0];
            if (isDefined(func)) {
                func();
            }
        };

        // adds a function to the queue and calls run if the queue was empty.
        var add = function add(func) {
            assert(isFunction(func), 'utils.makeQueue.add : added objects must be a function', func);
            queue.push(func);
            if (queue.length === 1) {
                run();
            }
        };

        // removes the first element from the queue and calls run. note that
        // it is not possible to pre-call done in order to have multiple
        // functions execute immediately.
        var done = function done() {
            // calling shift on an empty array does nothing.
            queue.shift();
            run();
        };

        return { add: add, done: done };
    };

    // a bus construct created by this function is exposed by the use interface.
    // in this context, the term event is used instead of blob.
    var makeBus = function makeBus() {
        // stores arrays of handlers for each event key.
        var handlers = {};
        // stores names from named events to enforce uniqueness.
        var names = {};

        // attaches a handler to a specific event key.
        var on = function on(type, handler) {
            assert(isString(type), 'utils.bus : handler type is not a string', type);
            assert(isFunction(handler), 'utils.bus : handler is not a function', handler);
            if (!isDefined(handlers[type])) {
                handlers[type] = [];
            }
            handlers[type].push(handler);
        };

        // accepts events and invokes the appropriate handlers for each key.
        var handle = function handle(event) {
            assert(isObject(event), 'utils.bus : event is not an object', event);
            var name = event.name;

            if (isDefined(name)) {
                assert(isString(name), 'utils.bus : event name is not a string', name);
                // early return if the name has been used before.
                if (isDefined(names[name])) {
                    return;
                }
                names[name] = true;
            }
            var handlerKeys = Object.keys(event);
            for (var i = 0; i < handlerKeys.length; ++i) {
                var key = handlerKeys[i];
                if (!isDefined(handlers[key])) {
                    continue;
                }
                for (var j = 0; j < handlers[key].length; ++j) {
                    handlers[key][j](event[key]);
                }
            }
        };

        return Object.assign(handle, { on: on });
    };

    return {
        deepCopy: deepCopy,
        assert: assert,
        isDefined: isDefined,
        isNull: isNull,
        isArray: isArray,
        isFunction: isFunction,
        isString: isString,
        isNumber: isNumber,
        isBoolean: isBoolean,
        isObject: isObject,
        isNode: isNode,
        isRegExp: isRegExp,
        isBrowser: isBrowser,
        makeQueue: makeQueue,
        makeBus: makeBus
    };
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var core = __webpack_require__(2);

module.exports = core({
    modules: [__webpack_require__(3), __webpack_require__(4), __webpack_require__(5), __webpack_require__(6), __webpack_require__(7), __webpack_require__(8), __webpack_require__(9)],
    options: {
        kit: 'lite',
        browser: true
    }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(0)(),
    isFunction = _require.isFunction,
    isDefined = _require.isDefined,
    isObject = _require.isObject,
    assert = _require.assert,
    isBrowser = _require.isBrowser,
    makeBus = _require.makeBus;

// version cannot be taken from package.json because environment is not guaranteed.


var version = '2.0.0';

module.exports = function (_ref) {
    var _ref$modules = _ref.modules,
        modules = _ref$modules === undefined ? [] : _ref$modules,
        _ref$options = _ref.options,
        options = _ref$options === undefined ? {} : _ref$options;

    // if it is needed to define the window but not yet add a target, the first
    // argument can be set to undefined.
    var okwolo = function okwolo(target, global) {
        // if the kit requires the browser api, there must be a window object in
        // scope or a window object must be injected as argument.
        if (options.browser) {
            if (!isDefined(global)) {
                assert(isBrowser(), 'app : must be run in a browser environment');
                global = window;
            }
        }

        // primary function will be called when app is called, it is stored
        // outside of the app function so that it can be replaced after the
        // creation of the app object without breaking all references to app.
        var primary = function primary() {};

        // the api will be added to the app function, it is returned when a
        // new app is created.
        var app = function app() {
            return primary.apply(undefined, arguments);
        };

        app.emit = makeBus();
        app.use = makeBus();

        app.use.on('api', function (api) {
            assert(isObject(api), 'core.use.api : additional api is not an object', api);
            Object.assign(app, api);
        });

        app.use.on('primary', function (_primary) {
            assert(isFunction(_primary), 'core.use.primary : primary is not a function', _primary);
            primary = _primary;
        });

        // each module is instantiated.
        modules.forEach(function (_module) {
            _module({
                emit: app.emit,
                use: app.use
            }, global);
        });

        // target is used if it is defined, but this step can be deferred
        // if it is not convenient to pass the target on app creation.
        if (isDefined(target)) {
            app.use({ target: target });
        }

        return app;
    };

    // okwolo attempts to define itself globally and includes information about
    // the version number and kit name. note that different kits can coexist,
    // but not two kits with the same name and different versions.
    if (isBrowser()) {
        okwolo.kit = options.kit;
        okwolo.version = version;
        if (!isDefined(window.okwolo)) {
            window.okwolo = okwolo;
        }
        window.okwolo[options.kit] = okwolo;
    }

    return okwolo;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires   emit #update  [view]
// @fires   use  #api     [core]
// @fires   use  #primary [core]
// @listens emit #state
// @listens emit #update
// @listens use  #build
// @listens use  #builder
// @listens use  #draw
// @listens use  #postbuild
// @listens use  #prebuild
// @listens use  #target
// @listens use  #update

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isFunction = _require.isFunction;

module.exports = function (_ref) {
    var emit = _ref.emit,
        use = _ref.use;

    var target = void 0;
    var builder = void 0;
    var build = void 0;
    var prebuild = void 0;
    var postbuild = void 0;
    var draw = void 0;
    var update = void 0;

    // stores an object returned by the draw and update functions. Since it is
    // also passed as an argument to update, it is convenient to store some
    // information about the current application's view in this variable.
    var view = void 0;

    // a copy of the state must be kept so that the view can be re-computed as
    // soon as any part of the rendering pipeline is modified.
    var state = void 0;

    // generates an object representing the view from the output of the builder.
    // note that it requires both the builder and the build functions to be
    // defined in order to complete successfully. they must be checked before
    // calling this function.
    var create = function create(state) {
        var temp = builder(state);
        if (prebuild) {
            temp = prebuild(temp);
        }
        temp = build(temp);
        if (postbuild) {
            temp = postbuild(temp);
        }
        return temp;
    };

    use.on('target', function (_target) {
        target = _target;
        emit({ update: true });
    });

    use.on('builder', function (_builder) {
        assert(isFunction(_builder), 'view.use.builder : builder is not a function', _builder);
        builder = _builder;
        emit({ update: false });
    });

    use.on('draw', function (_draw) {
        assert(isFunction(_draw), 'view.use.draw : new draw is not a function', _draw);
        draw = _draw;
        emit({ update: true });
    });

    use.on('update', function (_update) {
        assert(isFunction(_update), 'view.use.update : new target updater is not a function', _update);
        update = _update;
        emit({ update: false });
    });

    use.on('build', function (_build) {
        assert(isFunction(_build), 'view.use.build : new build is not a function', _build);
        build = _build;
        emit({ update: false });
    });

    use.on('prebuild', function (newPrebuild) {
        assert(isFunction(newPrebuild), 'view.use.prebuild : new prebuild is not a function', newPrebuild);
        prebuild = newPrebuild;
        emit({ update: false });
    });

    use.on('postbuild', function (newPostbuild) {
        assert(isFunction(newPostbuild), 'view.use.postbuild : new postbuild is not a function', newPostbuild);
        postbuild = newPostbuild;
        emit({ update: false });
    });

    emit.on('state', function (_state) {
        assert(isDefined(_state), 'view.emit.state : new state is not defined', _state);
        state = _state;
        emit({ update: false });
    });

    // tracks whether the app has been drawn. this information is used to
    // determing if the update or draw function should be called.
    var hasDrawn = false;

    // tracks whether there are enough pieces of the rendering pipeline to
    // succesfully create and render.
    var canDraw = false;

    // if the view has already been drawn, it is assumed that it can be updated
    // instead of redrawing again. the force argument can override this assumption
    // and require a redraw.
    emit.on('update', function (force) {
        // canDraw is saved to avoid doing the four checks on every update/draw.
        // it is assumed that once all four variables are set the first time, they
        // will never again be invalid. this should be enforced by the bus listeners.
        if (!canDraw) {
            if (isDefined(target) && isDefined(builder) && isDefined(state) && isDefined(build)) {
                canDraw = true;
            } else {
                return;
            }
        }
        if (!force && hasDrawn) {
            view = update(target, create(state), view);
            return;
        }
        view = draw(target, create(state));
        hasDrawn = true;
    });

    // the only functionality from the dom module that is directly exposed
    // is the update event.
    use({ api: {
            update: function update() {
                return emit({ update: false });
            }
        } });

    // primary functionality will be to replace buider. this is overwritten
    // by router modules to more easily associate routes to builders.
    use({ primary: function primary(init) {
            return use({ builder: init() });
        } });
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires use #build [view]

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isNull = _require.isNull,
    isArray = _require.isArray,
    isString = _require.isString,
    isNumber = _require.isNumber,
    isBoolean = _require.isBoolean,
    isObject = _require.isObject,
    isFunction = _require.isFunction;

// simulates the behavior of the classnames npm package. strings are concatenated,
// arrays are spread and objects keys are included if their value is truthy.


var classnames = function classnames() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return args.map(function (arg) {
        if (isString(arg)) {
            return arg;
        } else if (isArray(arg)) {
            return classnames.apply(undefined, _toConsumableArray(arg));
        } else if (isObject(arg)) {
            return classnames(Object.keys(arg).map(function (key) {
                return arg[key] && key;
            }));
        }
    }).filter(Boolean).join(' ');
};

// will build a vdom structure from the output of the app's builder funtions. this
// output must be valid element syntax, or an expception will be thrown.
var build = function build(element) {
    var ancestry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'root';

    // boolean values will produce no visible output to make it easier to use inline
    // logical expressions without worrying about unexpected strings on the page.
    if (isBoolean(element)) {
        element = null;
    }
    // null elements will produce no visible output. undefined is intentionally not
    // handled since it is often produced as a result of an unexpected builder output
    // and it should be made clear that something went wrong.
    if (isNull(element)) {
        return { text: '' };
    }
    // in order to simplify type checking, numbers are stringified.
    if (isNumber(element)) {
        element = String(element);
    }
    // strings will produce textNodes when rendered to the browser.
    if (isString(element)) {
        return { text: element };
    }

    // the only remaining element types are formatted as arrays.
    assert(isArray(element), 'view.build : vdom object is not a recognized type', ancestry, element);

    // early recursive return when the element is seen to be have the component syntax.
    if (isFunction(element[0])) {
        // leaving the props and children items undefined should not throw an error.
        var _element = element,
            _element2 = _slicedToArray(_element, 3),
            component = _element2[0],
            _element2$ = _element2[1],
            props = _element2$ === undefined ? {} : _element2$,
            _element2$2 = _element2[2],
            _children = _element2$2 === undefined ? [] : _element2$2;

        assert(isObject(props), 'view.build : component\'s props is not an object', ancestry, element, props);
        assert(isArray(_children), 'view.build : component\'s children is not an array', ancestry, element, _children);
        // the component function is called with an object containing the props
        // and an extra key with the children of this element.
        return build(component(Object.assign({}, props, { children: _children }), ancestry));
    }

    var _element3 = element,
        _element4 = _slicedToArray(_element3, 3),
        tagType = _element4[0],
        _element4$ = _element4[1],
        attributes = _element4$ === undefined ? {} : _element4$,
        _element4$2 = _element4[2],
        childList = _element4$2 === undefined ? [] : _element4$2;

    assert(isString(tagType), 'view.build : tag property is not a string', ancestry, element, tagType);
    assert(isObject(attributes), 'view.build : attributes is not an object', ancestry, element, attributes);
    assert(isArray(childList), 'view.build : children of vdom object is not an array', ancestry, element, childList);

    // regular expression to capture values from the shorthand element tag syntax.
    // it allows each section to be seperated by any amount of spaces, but enforces
    // the order of the capture groups (tagName #id .className | style)
    var match = /^ *(\w+) *(?:#([-\w\d]+))? *((?:\.[-\w\d]+)*)? *(?:\|\s*([^\s]{1}[^]*?))? *$/.exec(tagType);
    assert(isArray(match), 'view.build : tag property cannot be parsed', ancestry, tagType);
    // first element is not needed since it is the entire matched string. default
    // values are not used to avoid adding blank attributes to the nodes.

    var _match = _slicedToArray(match, 5),
        tagName = _match[1],
        id = _match[2],
        className = _match[3],
        style = _match[4];

    // priority is given to the id defined in the attributes.


    if (isDefined(id) && !isDefined(attributes.id)) {
        attributes.id = id.trim();
    }

    // class names from both the tag and the attributes are used.
    if (isDefined(attributes.className) || isDefined(className)) {
        attributes.className = classnames(attributes.className, className).replace(/\./g, ' ').replace(/  +/g, ' ').trim();
    }

    if (isDefined(style)) {
        if (!isDefined(attributes.style)) {
            attributes.style = style;
        } else {
            // extra semicolon is added if not present to prevent conflicts.
            style = (style + ';').replace(/;;$/g, ';');
            // styles defined in the attributes are given priority by being
            // placed after the ones from the tag.
            attributes.style = style + attributes.style;
        }
    }

    // ancestry is recorded to give more context to error messages
    ancestry += ' -> ' + tagType;

    // childList is converted to a children object with each child having its
    // own key. the child order is also recorded.
    var children = {};
    var childOrder = [];
    for (var i = 0; i < childList.length; ++i) {
        var childElement = childList[i];
        var key = i;
        var child = build(childElement, ancestry);
        // a key attribute will override the default array index key.
        if (child.attributes && 'key' in child.attributes) {
            key = child.attributes.key;
            assert(isNumber(key) || isString(key), 'view.build : invalid element key type', ancestry, key);
            assert(String(key).match(/^[\w\d-_]+$/g), 'view.build : invalid character in element key', ancestry, key);
        }
        // keys are normalized to strings to properly compare them.
        key = String(key);
        assert(!children[key], 'view.build : duplicate child key', ancestry, key);
        childOrder.push(key);
        children[key] = child;
    }

    return {
        tagName: tagName,
        attributes: attributes,
        children: children,
        childOrder: childOrder
    };
};

module.exports = function (_ref) {
    var use = _ref.use;

    use({ build: build });
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires use #draw   [view]
// @fires use #update [view]

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isDefined = _require.isDefined,
    isNode = _require.isNode,
    isFunction = _require.isFunction;

// finds the longest commmon of equal items between two input arrays.
// this function can make some optimizations by assuming that both
// arrays are of equal length, that all keys are unique and that all
// keys are found in both arrays.


var longestChain = function longestChain(original, successor) {
    var count = successor.length;
    var half = count / 2;
    // current longest chain reference is saved to compare against new
    // contenders. the chain's index in the second argument is also kept.
    var longest = 0;
    var chainStart = 0;
    for (var i = 0; i < count; ++i) {
        var startInc = original.indexOf(successor[i]);
        var maxInc = Math.min(count - startInc, count - i);
        // start looking after the current index since it is already
        // known to be equal.
        var currentLength = 1;
        // loop through all following values until either array is fully
        // read or the chain of identical values is broken.
        for (var inc = 1; inc < maxInc; ++inc) {
            if (successor[i + inc] !== original[startInc + inc]) {
                break;
            }
            currentLength += 1;
        }
        if (currentLength > longest) {
            longest = currentLength;
            chainStart = i;
        }
        // quick exit if a chain is found that is longer or equal to half
        // the length of the input arrays since it means there can be no
        // longer chains.
        if (longest >= half) {
            break;
        }
    }
    return {
        start: chainStart,
        end: chainStart + longest - 1
    };
};

// shallow diff of two objects which returns an array of keys where the value is
// different. differences include keys who's values have been deleted or added.
// since there is no reliable way to compare function equality, they are always
// considered to be different.
var diff = function diff(original, successor) {
    var keys = Object.keys(Object.assign({}, original, successor));
    var modifiedKeys = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var valueOriginal = original[key];
        var valueSuccessor = successor[key];
        if (isFunction(valueOriginal) || isFunction(valueSuccessor)) {
            modifiedKeys.push(key);
        }
        if (valueOriginal !== valueSuccessor) {
            modifiedKeys.push(key);
        }
    }
    return modifiedKeys;
};

module.exports = function (_ref, global) {
    var use = _ref.use;

    // recursively travels vdom to create rendered elements. after being rendered,
    // all vdom objects have a "DOM" key which references the created node. this
    // can be used in the update process to manipulate the real dom nodes.
    var render = function render(velem) {
        // the text key will only be present for text elements.
        if (isDefined(velem.text)) {
            velem.DOM = global.document.createTextNode(velem.text);
            return velem;
        }
        var element = global.document.createElement(velem.tagName);
        // attributes are added onto the node.
        Object.assign(element, velem.attributes);
        // all children are rendered and immediately appended into the parent node.
        for (var i = 0; i < velem.childOrder.length; ++i) {
            var key = velem.childOrder[i];

            var _render = render(velem.children[key]),
                DOM = _render.DOM;

            element.appendChild(DOM);
        }
        velem.DOM = element;
        return velem;
    };

    // initial draw to target will wipe the contents of the container node.
    var draw = function draw(target, vdom) {
        // the target's type is not enforced by the module and it needs to be
        // done at this point. this is done to decouple the dom module from
        // the browser (but cannot be avoided in this blob).
        assert(isNode(target), 'view.dom.draw : target is not a DOM node', target);
        render(vdom);
        global.requestAnimationFrame(function () {
            target.innerHTML = '';
            target.appendChild(vdom.DOM);
        });
        return vdom;
    };

    // updates the existing vdom object and its html nodes to be consistent with
    // the new vdom object.
    var update = function update(target, newVDOM, VDOM) {
        // responsibility of checking the target's type is deferred to the blobs.
        assert(isNode(target), 'view.dom.update : target is not a DOM node', target);

        // recursive function to update an element according to new state. the
        // parent and the element's parent index must be passed in order to make
        // modifications to the vdom object in place.
        var _update = function _update(original, successor, parent, parentKey) {
            // lack of original element implies the successor is a new element.
            if (!isDefined(original)) {
                parent.children[parentKey] = render(successor);
                parent.DOM.appendChild(parent.children[parentKey].DOM);
                return;
            }

            // lack of successor element implies the original is being removed.
            if (!isDefined(successor)) {
                parent.DOM.removeChild(original.DOM);
                delete parent.children[parentKey];
                return;
            }

            // if the element's tagName has changed, the whole element must be
            // replaced. this will also capture the case where an html node is
            // being transformed into a text node since the text node's vdom
            // object will not contain a tagName.
            if (original.tagName !== successor.tagName) {
                var oldDOM = original.DOM;
                var _newVDOM = render(successor);
                parent.DOM.replaceChild(_newVDOM.DOM, oldDOM);
                // this technique is used to modify the vdom object in place.
                // both the text element and the tag element props are reset
                // since the types are not recorded.
                Object.assign(original, {
                    DOM: undefined,
                    text: undefined,
                    tagName: undefined,
                    attributes: undefined,
                    children: undefined,
                    childOrder: undefined
                }, _newVDOM);
                return;
            }

            // nodeType of three indicates that the HTML node is a textNode.
            // at this point in the function it has been estblished that the
            // original and successor nodes are of the same type.
            if (original.DOM.nodeType === 3) {
                if (original.text !== successor.text) {
                    original.DOM.nodeValue = successor.text;
                    original.text = successor.text;
                }
                return;
            }

            var attributesDiff = diff(original.attributes, successor.attributes);
            for (var i = 0; i < attributesDiff.length; ++i) {
                var key = attributesDiff[i];
                original.attributes[key] = successor.attributes[key];
                original.DOM[key] = successor.attributes[key];
            }

            // list representing the actual order of children in the dom. it is
            // used later to rearrange nodes to match the desired child order.
            var childOrder = original.childOrder.slice();

            original.childOrder = successor.childOrder;

            // accumulate all child keys from both the original node and the
            // successor node. each child is then recursively updated.
            var childKeys = Object.keys(Object.assign({}, original.children, successor.children));
            for (var _i = 0; _i < childKeys.length; ++_i) {
                var _key = childKeys[_i];
                // new elements are moved to the end of the list.
                if (!original.children[_key]) {
                    childOrder.push(_key);
                    // deleted elements are removed from the list.
                } else if (!successor.children[_key]) {
                    childOrder.splice(childOrder.indexOf(_key), 1);
                }
                _update(original.children[_key], successor.children[_key], original, _key);
            }

            if (!childOrder.length) {
                return;
            }

            // the remainder of this function handles the reordering of the
            // node's children. current order in the dom is diffed agains the
            // correct order. as an optimization, only the longest common chain
            // of keys is kept in place and the nodes that are supposed to be
            // before and after are moved into position. this solution was
            // chosen because it is a relatively cheap computation, can be
            // implemented concisely and is compatible with the restriction that
            // dom nodes can only be moved one at a time.

            var _longestChain = longestChain(childOrder, successor.childOrder),
                start = _longestChain.start,
                end = _longestChain.end;

            // elements before the "correct" chain are prepended to the parent.
            // another important consideration is that dom nodes can only exist
            // in one position in the dom. this means that moving a node
            // implicitly removes it from its original position.


            var startKeys = successor.childOrder.slice(0, start);
            for (var _i2 = startKeys.length - 1; _i2 >= 0; --_i2) {
                var _key2 = startKeys[_i2];
                original.DOM.insertBefore(original.children[_key2].DOM, original.DOM.firstChild);
            }

            // elements after the "correct" chain are appended to the parent.
            var endKeys = successor.childOrder.slice(end + 1, Infinity);
            for (var _i3 = 0; _i3 < endKeys.length; ++_i3) {
                var _key3 = endKeys[_i3];
                original.DOM.appendChild(original.children[_key3].DOM);
            }
        };

        global.requestAnimationFrame(function () {
            try {
                _update(VDOM, newVDOM, { DOM: target, children: { root: VDOM } }, 'root');
            } catch (e) {
                console.error('view.dom.update : ' + e);
            }
        });

        // TODO vdom object is modified after being returned.
        return VDOM;
    };

    use({
        draw: draw,
        update: update
    });
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires   emit #redirect [router]
// @fires   emit #show     [router]
// @fires   use  #api      [core]
// @fires   use  #primary  [core]
// @listens emit #redirect
// @listens emit #show
// @listens use  #base
// @listens use  #fetch
// @listens use  #register
// @listens use  #route

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    isString = _require.isString,
    isObject = _require.isObject,
    isFunction = _require.isFunction,
    makeQueue = _require.makeQueue;

module.exports = function (_ref, global) {
    var emit = _ref.emit,
        use = _ref.use;

    // will check is the code is being ran from the filesystem or is hosted.
    // this information is used to correctly displaying routes in the former case.
    var isHosted = global.document.origin !== null && global.document.origin !== 'null';

    var baseUrl = '';

    // keeps track of all the registered routes. the format/type of this variable
    // is not enforced by this module and it is left to the regisiter and fetch
    // to validate the values.
    var store = void 0;

    var register = void 0;
    var fetch = void 0;

    // if the router has not yet found a match, every new path might be the
    // the current location and needs to be called. however, after this initial
    // match, any new routes do not need to be verified against the current url.
    var hasMatched = false;

    var queue = makeQueue();

    var safeFetch = function safeFetch() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        assert(isFunction(fetch), 'router : fetch is not a function', fetch);
        fetch.apply(undefined, [store].concat(args));
    };

    var removeBaseUrl = function removeBaseUrl(path) {
        // escapes characters that may cause unintended behavior when converted
        // from a string to a regular expression.
        var escapedBaseUrl = baseUrl.replace(/([^\w])/g, '\\$1');
        return path.replace(new RegExp('\^' + escapedBaseUrl), '') || '';
    };

    var currentPath = global.location.pathname;
    if (!isHosted) {
        currentPath = '';
    }

    // handle back/forward events
    global.onpopstate = function () {
        currentPath = removeBaseUrl(global.location.pathname);
        safeFetch(currentPath);
    };

    use.on('route', function () {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref2.path,
            handler = _ref2.handler;

        assert(isString(path), 'router.use.route : path is not a string', path);
        assert(isFunction(handler), 'router.use.route : handler is not a function', path, handler);
        assert(isFunction(register), 'route.use.route : register is not a function', register);
        store = register(store, path, handler);
        if (!hasMatched) {
            hasMatched = !!safeFetch(currentPath);
        }
    });

    use.on('base', function (base) {
        assert(isString(base), 'router.use.base : base url is not a string', base);
        baseUrl = base;
        currentPath = removeBaseUrl(currentPath);
        safeFetch(currentPath);
    });

    use.on('register', function (_register) {
        assert(isFunction(_register), 'router.use.register : register is not a function', register);
        register = _register;
    });

    use.on('fetch', function (_fetch) {
        assert(isFunction(_fetch), 'router.use.fetch : fetch is not a function', fetch);
        fetch = _fetch;
    });

    // fetch wrapper that makes the browser aware of the url change
    emit.on('redirect', function () {
        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref3.path,
            _ref3$params = _ref3.params,
            params = _ref3$params === undefined ? {} : _ref3$params;

        assert(isString(path), 'router.redirect : path is not a string', path);
        assert(isObject(params), 'router.redirect : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(function () {
            currentPath = path;
            if (isHosted) {
                // edge doesn't care that the file is local and will allow pushState.
                // it also includes "/C:" in the location.pathname, but adds it to
                // the path given to pushState. which means it needs to be removed here.
                global.history.pushState({}, '', (baseUrl + currentPath).replace(/^\/C\:/, ''));
            } else {
                console.log('@okwolo/router:: path changed to\n>>> ' + currentPath);
            }
            safeFetch(currentPath, params);
            queue.done();
        });
    });

    // this will act like a redirect, but will not change the browser's url.
    emit.on('show', function () {
        var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            path = _ref4.path,
            _ref4$params = _ref4.params,
            params = _ref4$params === undefined ? {} : _ref4$params;

        assert(isString(path), 'router.show : path is not a string', path);
        assert(isObject(params), 'router.show : params is not an object', params);
        // queue used so that route handlers that call route handlers behave
        // as expected. (sequentially)
        queue.add(function () {
            safeFetch(path, params);
            queue.done();
        });
    });

    // expose module's features to the app.
    use({ api: {
            redirect: function redirect(path, params) {
                return emit({ redirect: { path: path, params: params } });
            },
            show: function show(path, params) {
                return emit({ show: { path: path, params: params } });
            }
        } });

    // first argument can be a path string to register a route handler
    // or a function to directly use a builder.
    use({ primary: function primary(path, builder) {
            if (isFunction(path)) {
                use({ builder: path() });
                return;
            }
            use({ route: {
                    path: path,
                    handler: function handler(params) {
                        use({ builder: builder(params) });
                    }
                } });
        } });
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires use #fetch [router]

module.exports = function (_ref) {
    var use = _ref.use;

    // the store's initial value is undefined so it needs to be defaulted
    // to an empty array. this function should be the one doing the action
    // defined in the route since it doesn't return it.
    var fetch = function fetch() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var found = false;
        store.find(function (registeredPath) {
            var test = registeredPath.pattern.exec(path);
            if (test === null) {
                return;
            }
            // a non null value on the result of executing the query on the path
            // is considered a successful hit.
            found = true;
            // the first element of the result array is the entire matched string.
            // this value is not useful and the following capture group results
            // are more relevant.
            test.shift();
            // the order of the keys and their values in the matched result is the
            // same and their index is now shared. note that there is no protection
            // against param values being overwritten or tags to share the same key.
            registeredPath.keys.forEach(function (key, i) {
                params[key.name] = test[i];
            });
            registeredPath.handler(params);
            return found;
        });
        return found;
    };

    use({ fetch: fetch });
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires use #register [router]

var keyPattern = /:\w+/g;

// creates a regex pattern from an input path string. all tags are replaced by a
// capture group and special characters are escaped.
var createPattern = function createPattern(path) {
    var pattern = path
    // the colon character is not escaped since it is used to denote tags.
    .replace(/([^\w:])/g, '\\$1').replace(keyPattern, '([^/]*)');
    // adds a condition to ignore the contents of the query string.
    return new RegExp('^' + pattern + '(:?\\?.*)?$');
};

module.exports = function (_ref) {
    var use = _ref.use;

    // the type of store is not enforced by the okwolo-router module. this means
    // that it needs to be created when the first path is registered.
    var register = function register() {
        var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var path = arguments[1];
        var handler = arguments[2];

        // the keys are extracted from the path string and stored to properly
        // assign the url's values to the right keys in the params.
        var keys = (path.match(keyPattern) || []).map(function (key) {
            return {
                name: key.replace(/^:/g, '')
            };
        });
        store.push({
            keys: keys,
            pattern: createPattern(path),
            handler: handler
        });
        return store;
    };

    use({ register: register });
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// @fires   emit #state   [state]
// @fires   use  #api     [core]
// @fires   use  #handler [state]
// @listens emit #state
// @listens use  #handler

var _require = __webpack_require__(0)(),
    assert = _require.assert,
    deepCopy = _require.deepCopy,
    isFunction = _require.isFunction;

module.exports = function (_ref) {
    var emit = _ref.emit,
        use = _ref.use;

    // reference to initial state is kept to be able to track whether it
    // has changed using strict equality.
    var initial = {};
    var state = initial;

    var handler = void 0;

    // current state is monitored and stored.
    emit.on('state', function (newState) {
        state = newState;
    });

    use.on('handler', function (handlerGen) {
        assert(isFunction(handlerGen), 'state.use.handler : handler generator is not a function', handlerGen);
        // handler generator is given direct access to the state.
        var _handler = handlerGen(function () {
            return state;
        });
        assert(isFunction(_handler), 'state.use.handler : handler from generator is not a function', _handler);
        handler = _handler;
    });

    use({ handler: function handler() {
            return function (newState) {
                emit({ state: newState });
            };
        } });

    var setState = function setState(replacement) {
        var newState = isFunction(replacement) ? replacement(deepCopy(state)) : replacement;
        handler(newState);
    };

    var getState = function getState() {
        assert(state !== initial, 'state.getState : cannot get state before it has been set');
        return deepCopy(state);
    };

    // expose module's features to the app.
    use({ api: {
            setState: setState,
            getState: getState
        } });
};

/***/ })
/******/ ]);