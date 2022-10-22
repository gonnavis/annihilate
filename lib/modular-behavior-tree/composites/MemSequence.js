'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('../constants');

var _Composite2 = require('../core/Composite');

var _Composite3 = _interopRequireDefault(_Composite2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MemSequence = function (_Composite) {
    _inherits(MemSequence, _Composite);

    function MemSequence() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$children = _ref.children,
            children = _ref$children === undefined ? [] : _ref$children;

        _classCallCheck(this, MemSequence);

        var _this = _possibleConstructorReturn(this, (MemSequence.__proto__ || Object.getPrototypeOf(MemSequence)).call(this, {
            children: children
        }));

        _this._openNodeIndex = null;
        return _this;
    }

    _createClass(MemSequence, [{
        key: 'run',
        value: async function run(blackboard, tick) {

            for (var i = 0; i < this.children.length; i++) {
                if (!this._openNodeIndex || this._openNodeIndex && this._openNodeIndex === i) {
                    var status = await this.children[i]._execute(blackboard, tick);
                    this._openNodeIndex = status === _constants.RUNNING ? i : null;
                    if (status !== _constants.SUCCESS) return status;
                }
            }

            return _constants.SUCCESS;
        }
    }]);

    return MemSequence;
}(_Composite3.default);

module.exports = MemSequence;