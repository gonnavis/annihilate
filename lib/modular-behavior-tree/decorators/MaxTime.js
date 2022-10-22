import { SUCCESS, FAILURE, RUNNING } from '../constants';
import Decorator from '../core/Decorator';

class MaxTime extends Decorator {

    constructor({ properties = { ms: 0 }, child = null } = {}) {
        super({
            child,
            properties
        });
    }

    start(blackboard, tick) {
        this.startTime = Date.now();
    }

    async run(blackboard, tick) {

        if (!this.child) throw new Error("No child defined for MaxTime");

        let status = await this.child._execute(blackboard, tick);

        if (Date.now() - this.startTime > this.properties.ms) {
            return FAILURE;
        }

        return status;
    }

}

module.exports = MaxTime;
//# sourceMappingURL=MaxTime.js.map