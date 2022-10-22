import { createUUID } from '../functions.js';
import { RUNNING } from '../constants.js';

export default class BaseNode {

    constructor({ properties, category } = {}) {
        this._uuid = createUUID();
        this.category = category || '';
        this.properties = properties || {};
    }

    async _execute(blackboard, tick) {
        if (!tick.isOpen(this)) await this._start(blackboard, tick);
        let status = await this._run(blackboard, tick);
        if (status !== RUNNING) await this._end(blackboard, tick);
        return status;
    }

    async _start(blackboard, tick) {
        tick.open(this);
        await this.start(blackboard, tick);
    }

    async _run(blackboard, tick) {
        return await this.run(blackboard, tick);
    }

    async _end(blackboard, tick) {
        tick.close(this);
        await this.end(blackboard, tick);
    }

    async start(blackboard, tick) {}

    async run(blackboard, tick) {}

    async end(blackboard, tick) {}

}