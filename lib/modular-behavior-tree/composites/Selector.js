import { FAILURE } from '../constants.js';
import Composite from '../core/Composite.js';

class Selector extends Composite {

    constructor({ children = [] } = {}) {
        super({
            children
        });
    }

    async run(blackboard, tick) {

        for (let i = 0; i < this.children.length; i++) {
            let status = await this.children[i]._execute(blackboard, tick);
            if (status !== FAILURE) return status;
        }

        return FAILURE;
    }

}

module.exports = Selector;
//# sourceMappingURL=Selector.js.map