import { SUCCESS, RUNNING } from '../constants';
import Composite from '../core/Composite';

class MemSequence extends Composite {

    constructor({ children = [] } = {}) {
        super({
            children
        });
        this._openNodeIndex = null;
    }

    async run(blackboard, tick) {

        for (let i = 0; i < this.children.length; i++) {
            if (!this._openNodeIndex || this._openNodeIndex && this._openNodeIndex === i) {
                let status = await this.children[i]._execute(blackboard, tick);
                this._openNodeIndex = status === RUNNING ? i : null;
                if (status !== SUCCESS) return status;
            }
        }

        return SUCCESS;
    }

}

module.exports = MemSequence;
//# sourceMappingURL=MemSequence.js.map