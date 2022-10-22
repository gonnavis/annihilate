'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseNode2 = require('./BaseNode');

var _BaseNode3 = _interopRequireDefault(_BaseNode2);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Condition = function (_BaseNode) {
    _inherits(Condition, _BaseNode);

    function Condition() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$child = _ref.child,
            child = _ref$child === undefined ? null : _ref$child,
            properties = _ref.properties;

        _classCallCheck(this, Condition);

        var _this = _possibleConstructorReturn(this, (Condition.__proto__ || Object.getPrototypeOf(Condition)).call(this, {
            category: _constants.CONDITION,
            properties: properties
        }));

        _this.child = child;
        return _this;
    }

    return Condition;
}(_BaseNode3.default);

exports.default = Condition;