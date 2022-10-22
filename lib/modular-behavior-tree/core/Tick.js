

export default class Tick {

    constructor() {
        this._openNodes = [];
        this._nodesOpened = 0;
    }

    setOpenNodes(nodes) {
        this._openNodes = nodes;
    }

    getOpenNodes() {
        return this._openNodes;
    }

    getNodesOpened() {
        return this._nodesOpened;
    }

    isOpen(node) {
        return this._openNodes.includes(node._uuid);
    }

    open(node) {
        this._nodesOpened++;
        this._openNodes.push(node._uuid);
    }

    close(node) {

        var index = this._openNodes.indexOf(node._uuid);
        if (index > -1) {
            this._openNodes.splice(index, 1);
        }
        //this._openNodes.pop()
    }

    reset() {
        this._openNodes = [];
    }

}
//# sourceMappingURL=Tick.js.map