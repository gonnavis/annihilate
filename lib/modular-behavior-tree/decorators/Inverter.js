import { SUCCESS, FAILURE, RUNNING } from '../constants.js';
import Decorator from '../core/Decorator.js';

class Inverter extends Decorator {

    constructor({ child = null } = {}) {
        super({
            child
        });
    }

    async run(blackboard, tick) {

        if (!this.child) throw new Error("No child defined for Inverter");

        let status = await this.child._execute(blackboard, tick);

        switch (status) {
            case SUCCESS:
                return FAILURE;
            case FAILURE:
                return SUCCESS;
            default:
                return status;
        }
    }

}

module.exports = Inverter;
//# sourceMappingURL=Inverter.js.map