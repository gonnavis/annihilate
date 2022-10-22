import Action from '../core/Action';
import { SUCCESS, RUNNING } from '../constants';

export default class Wait extends Action {

    constructor({ properties = { ms: 0 } } = {}) {
        super({ properties });
    }

    start() {
        this.startTime = Date.now();
    }

    run(blackboard) {
        if (Date.now() - this.startTime < this.properties.ms) {
            return RUNNING;
        }
        return SUCCESS;
    }

}
//# sourceMappingURL=Wait.js.map