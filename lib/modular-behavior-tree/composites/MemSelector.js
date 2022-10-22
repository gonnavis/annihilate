import { FAILURE } from '../constants.js';
import Composite from '../core/Composite.js';

class MemSelector extends Composite {

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
                if (status !== FAILURE) return status;
            }
        }

        return FAILURE;
    }

}

module.exports = MemSelector;
//# sourceMappingURL=MemSelector.js.map