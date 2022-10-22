import { SUCCESS, RUNNING } from '../constants';
import Composite from '../core/Composite';

class Sequence extends Composite {

    constructor({ children = [] } = {}) {
        super({
            children
        });
    }

    async run(blackboard, tick) {

        for (let i = 0; i < this.children.length; i++) {
            let status = await this.children[i]._execute(blackboard, tick);
            if (status !== SUCCESS) return status;
        }

        return SUCCESS;
    }

}

module.exports = Sequence;
//# sourceMappingURL=Sequence.js.map