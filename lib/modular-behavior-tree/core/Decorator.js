import BaseNode from './BaseNode.js';
import { DECORATOR } from '../constants.js';

export default class Composite extends BaseNode {

    constructor({ child = null, properties } = {}) {
        super({
            category: DECORATOR,
            properties
        });
        this.child = child;
    }

}
//# sourceMappingURL=Decorator.js.map