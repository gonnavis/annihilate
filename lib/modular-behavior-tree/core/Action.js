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

export default Action;