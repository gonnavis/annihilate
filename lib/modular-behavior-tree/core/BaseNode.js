'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functions = require('../functions');

var _constants = require('../constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseNode = function () {
    function BaseNode() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            properties = _ref.properties,
            category = _ref.category;

        _classCallCheck(this, BaseNode);

        this._uuid = (0, _functions.createUUID)();
        this.category = category || '';
        this.properties = properties || {};
    }

    _createClass(BaseNode, [{
        key: '_execute',
        value: async function _execute(blackboard, tick) {
            if (!tick.isOpen(this)) await this._start(blackboard, tick);
            var status = await this._run(blackboard, tick);
            if (status !== _constants.RUNNING) await this._end(blackboard, tick);
            return status;
        }
    }, {
        key: '_start',
        value: async function _start(blackboard, tick) {
            tick.open(this);
            await this.start(blackboard, tick);
        }
    }, {
        key: '_run',
        value: async function _run(blackboard, tick) {
            return await this.run(blackboard, tick);
        }
    }, {
        key: '_end',
        value: async function _end(blackboard, tick) {
            tick.close(this);
            await this.end(blackboard, tick);
        }
    }, {
        key: 'start',
        value: async function start(blackboard, tick) {}
    }, {
        key: 'run',
        value: async function run(blackboard, tick) {}
    }, {
        key: 'end',
        value: async function end(blackboard, tick) {}
    }]);

    return BaseNode;
}();

exports.default = BaseNode;