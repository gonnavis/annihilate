import BaseNode from './BaseNode.js';
import { ACTION } from '../constants.js';

class Action extends BaseNode {

    constructor({ properties } = {}) {
        super({
            category: ACTION,
            properties
        });
    }

}

module.exports = Action;
//# sourceMappingURL=Action.js.map