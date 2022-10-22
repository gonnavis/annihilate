'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tick = require('./Tick');

var _Tick2 = _interopRequireDefault(_Tick);

var _BaseNode = require('./BaseNode');

var _BaseNode2 = _interopRequireDefault(_BaseNode);

var _functions = require('../functions');

var _constants = require('../constants');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _xmlParser = require('xml-parser');

var _xmlParser2 = _interopRequireDefault(_xmlParser);

var _composites = require('../composites');

var composites = _interopRequireWildcard(_composites);

var _decorators = require('../decorators');

var decorators = _interopRequireWildcard(_decorators);

var _actions = require('../actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BehaviorTree = function () {
    function BehaviorTree(_ref) {
        var tree = _ref.tree,
            blackboard = _ref.blackboard;

        _classCallCheck(this, BehaviorTree);

        this._tree = BehaviorTree._cloneNode(tree);
        this._blackboard = blackboard;
        this._registry = {};
        this._tick = null;
        this._lastResult = null;
        this._lastOpenNodes = [];
    }

    _createClass(BehaviorTree, [{
        key: 'tick',
        value: async function tick() {

            this._tick = new _Tick2.default();
            this._tick.setOpenNodes(this._lastOpenNodes);
            this._lastResult = await this._tree._execute(this._blackboard, this._tick);
            this._lastOpenNodes = this._tick.getOpenNodes();

            if (this._lastResult !== _constants.RUNNING) {
                this._lastOpenNodes = [];
            }
        }
    }], [{
        key: 'parseFileXML',
        value: function parseFileXML(path, names) {

            names = names || {};

            var xml = _fs2.default.readFileSync(path, 'utf8');
            var obj = (0, _xmlParser2.default)(xml);

            if (obj.root.children.length < 1) throw new Error('BehaviorTree needs one child node');
            if (obj.root.children.length > 1) throw new Error('BehaviorTree can have only one child node');

            var node = this._parseXMLNode(obj.root.children[0], names);
            return node;
        }
    }, {
        key: '_parseXMLNode',
        value: function _parseXMLNode(xmlnode, registry) {

            var Cls = void 0;

            if (xmlnode.name in registry) {
                Cls = registry[xmlnode.name];
            } else if (xmlnode.name in decorators) {
                Cls = decorators[xmlnode.name];
            } else if (xmlnode.name in composites) {
                Cls = composites[xmlnode.name];
            } else if (xmlnode.name in actions) {
                Cls = actions[xmlnode.name];
            } else {
                throw new EvalError('Invalid node: ' + xmlnode.name);
            }

            if (Cls instanceof _BaseNode2.default) {
                var cloned_node = this._cloneNode(Cls);
                return cloned_node;
            }

            var node = new Cls({ properties: xmlnode.attributes });

            switch (node.category) {
                case _constants.COMPOSITE:
                    for (var i = 0; i < xmlnode.children.length; i++) {
                        var child = this._parseXMLNode(xmlnode.children[i], registry);
                        node.children.push(child);
                    }
                    break;
                case _constants.DECORATOR:
                    if (xmlnode.children.length < 1) throw new Error('Decorator ' + xmlnode.name + ' requires one child node');
                    if (xmlnode.children.length > 1) throw new Error('Decorator ' + xmlnode.name + ' can have only one child node');
                    node.child = this._parseXMLNode(xmlnode.children[0]);
                    break;
            }

            return node;
        }
    }, {
        key: '_cloneNode',
        value: function _cloneNode(node) {

            var clone = Object.assign(Object.create(Object.getPrototypeOf(node)), node);

            clone._uuid = (0, _functions.createUUID)();

            switch (clone.category) {
                case _constants.COMPOSITE:
                    var newChildren = [];
                    for (var i = 0; i < clone.children.length; i++) {
                        newChildren.push(this._cloneNode(clone.children[i]));
                    }
                    clone.children = newChildren;
                    break;
                case _constants.DECORATOR:
                    clone.child = this._cloneNode(clone.children[0]);
                    break;
            }

            return clone;
        }
    }]);

    return BehaviorTree;
}();

exports.default = BehaviorTree;