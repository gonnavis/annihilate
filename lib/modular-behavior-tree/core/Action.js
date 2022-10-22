import BaseNode from './BaseNode';
import { ACTION } from '../constants';

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