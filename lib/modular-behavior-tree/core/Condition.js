import BaseNode from './BaseNode';
import { CONDITION } from '../constants';

export default class Condition extends BaseNode {

    constructor({ child = null, properties } = {}) {
        super({
            category: CONDITION,
            properties
        });
        this.child = child;
    }

}
//# sourceMappingURL=Condition.js.map