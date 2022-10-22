'use strict';

var _BaseNode2 = require('./BaseNode');

var _BaseNode3 = _interopRequireDefault(_BaseNode2);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = function (_BaseNode) {
    _inherits(Action, _BaseNode);

    function Action() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            properties = _ref.properties;

        _classCallCheck(this, Action);

        return _possibleConstructorReturn(this, (Action.__proto__ || Object.getPrototypeOf(Action)).call(this, {
            category: _constants.ACTION,
            properties: properties
        }));
    }

    return Action;
}(_BaseNode3.default);

module.exports = Action;