import { SUCCESS, FAILURE, RUNNING } from '../constants';
import Decorator from '../core/Decorator';

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