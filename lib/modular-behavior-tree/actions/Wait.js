'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Action2 = require('../core/Action');

var _Action3 = _interopRequireDefault(_Action2);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Wait = function (_Action) {
    _inherits(Wait, _Action);

    function Wait() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$properties = _ref.properties,
            properties = _ref$properties === undefined ? { ms: 0 } : _ref$properties;

        _classCallCheck(this, Wait);

        return _possibleConstructorReturn(this, (Wait.__proto__ || Object.getPrototypeOf(Wait)).call(this, { properties: properties }));
    }

    _createClass(Wait, [{
        key: 'start',
        value: function start() {
            this.startTime = Date.now();
        }
    }, {
        key: 'run',
        value: function run(blackboard) {
            if (Date.now() - this.startTime < this.properties.ms) {
                return _constants.RUNNING;
            }
            return _constants.SUCCESS;
        }
    }]);

    return Wait;
}(_Action3.default);

exports.default = Wait;