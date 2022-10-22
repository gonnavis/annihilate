"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tick = function () {
    function Tick() {
        _classCallCheck(this, Tick);

        this._openNodes = [];
        this._nodesOpened = 0;
    }

    _createClass(Tick, [{
        key: "setOpenNodes",
        value: function setOpenNodes(nodes) {
            this._openNodes = nodes;
        }
    }, {
        key: "getOpenNodes",
        value: function getOpenNodes() {
            return this._openNodes;
        }
    }, {
        key: "getNodesOpened",
        value: function getNodesOpened() {
            return this._nodesOpened;
        }
    }, {
        key: "isOpen",
        value: function isOpen(node) {
            return this._openNodes.includes(node._uuid);
        }
    }, {
        key: "open",
        value: function open(node) {
            this._nodesOpened++;
            this._openNodes.push(node._uuid);
        }
    }, {
        key: "close",
        value: function close(node) {

            var index = this._openNodes.indexOf(node._uuid);
            if (index > -1) {
                this._openNodes.splice(index, 1);
            }
        }
    }, {
        key: "reset",
        value: function reset() {
            this._openNodes = [];
        }
    }]);

    return Tick;
}();

exports.default = Tick;