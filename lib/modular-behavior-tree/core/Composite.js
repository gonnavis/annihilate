import BaseNode from './BaseNode.js';
import { COMPOSITE } from '../constants.js';

export default class Composite extends BaseNode {

    constructor({ children = [], properties } = {}) {
        super({
            category: COMPOSITE,
            properties
        });
        this.children = children.slice(0);
    }

}
//# sourceMappingURL=Composite.js.map