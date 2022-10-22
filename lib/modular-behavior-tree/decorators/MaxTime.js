import { SUCCESS, FAILURE, RUNNING } from '../constants.js';
import Decorator from '../core/Decorator.js';

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

export default MaxTime;