import BaseNode from './BaseNode';
import { COMPOSITE } from '../constants';

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