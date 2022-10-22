'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

var _Decorator2 = require('../core/Decorator');

var _Decorator3 = _interopRequireDefault(_Decorator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Inverter = function (_Decorator) {
    _inherits(Inverter, _Decorator);

    function Inverter() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$child = _ref.child,
            child = _ref$child === undefined ? null : _ref$child;

        _classCallCheck(this, Inverter);

        return _possibleConstructorReturn(this, (Inverter.__proto__ || Object.getPrototypeOf(Inverter)).call(this, {
            child: child
        }));
    }

    _createClass(Inverter, [{
        key: 'run',
        value: async function run(blackboard, tick) {

            if (!this.child) throw new Error("No child defined for Inverter");

            var status = await this.child._execute(blackboard, tick);

            switch (status) {
                case _constants.SUCCESS:
                    return _constants.FAILURE;
                case _constants.FAILURE:
                    return _constants.SUCCESS;
                default:
                    return status;
            }
        }
    }]);

    return Inverter;
}(_Decorator3.default);

module.exports = Inverter;