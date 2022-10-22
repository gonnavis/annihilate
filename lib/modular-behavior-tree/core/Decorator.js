import BaseNode from './BaseNode';
import { DECORATOR } from '../constants';

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