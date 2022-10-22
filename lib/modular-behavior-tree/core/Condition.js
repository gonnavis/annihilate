import BaseNode from './BaseNode.js';
import { CONDITION } from '../constants.js';

export default class Condition extends BaseNode {

    constructor({ child = null, properties } = {}) {
        super({
            category: CONDITION,
            properties
        });
        this.child = child;
    }

}