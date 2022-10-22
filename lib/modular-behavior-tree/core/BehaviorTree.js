import Tick from './Tick.js';
import BaseNode from './BaseNode.js';
import { createUUID } from '../functions.js';
import { SUCCESS, FAILURE, RUNNING, COMPOSITE, ACTION, DECORATOR, CONDITION } from '../constants.js';
// import fs from 'fs';
import parse from './xml-parser.js';

import * as composites from '../composites/index.js';
import * as decorators from '../decorators/index.js';
import * as actions from '../actions/index.js';

export default class BehaviorTree {

    constructor({ tree, blackboard }) {
        this._tree = BehaviorTree._cloneNode(tree);
        this._blackboard = blackboard;
        this._registry = {};
        this._tick = null;
        this._lastResult = null;
        this._lastOpenNodes = [];
    }

    /**
     * 
     * @param {String} path Path to XML File
     * @param {Object} names Names should be an object containing the class or a nodeobj {MyAction: MyAction} {SubTree1: subtree1}
     */
    static parseFileXML(path, names) {

        //console.log(names)

        names = names || {};

        // let xml = fs.readFileSync(path, 'utf8');
        let xml = `
            <BehaviorTree>
                <MemSequence>
                    <F0 />
                    <F1 />
                    <F2 />
                </MemSequence>
            </BehaviorTree>
        `
        let obj = parse(xml);

        if (obj.root.children.length < 1) throw new Error('BehaviorTree needs one child node');
        if (obj.root.children.length > 1) throw new Error('BehaviorTree can have only one child node');

        let node = this._parseXMLNode(obj.root.children[0], names);
        return node;
    }

    static _parseXMLNode(xmlnode, registry) {

        let Cls;

        if (xmlnode.name in registry) {
            Cls = registry[xmlnode.name];
        } else if (xmlnode.name in decorators) {
            Cls = decorators[xmlnode.name];
        } else if (xmlnode.name in composites) {
            Cls = composites[xmlnode.name];
        } else if (xmlnode.name in actions) {
            Cls = actions[xmlnode.name];
        } else {
            throw new EvalError(`Invalid node: ${xmlnode.name}`);
        }

        // if obj (subtree) -> clone 
        if (Cls instanceof BaseNode) {
            let cloned_node = this._cloneNode(Cls);
            return cloned_node;
        }

        // if class -> create instance
        let node = new Cls({ properties: xmlnode.attributes });

        switch (node.category) {
            case COMPOSITE:
                for (let i = 0; i < xmlnode.children.length; i++) {
                    let child = this._parseXMLNode(xmlnode.children[i], registry);
                    node.children.push(child);
                }
                break;
            case DECORATOR:
                if (xmlnode.children.length < 1) throw new Error(`Decorator ${xmlnode.name} requires one child node`);
                if (xmlnode.children.length > 1) throw new Error(`Decorator ${xmlnode.name} can have only one child node`);
                node.child = this._parseXMLNode(xmlnode.children[0]);
                break;
        }

        return node;
    }

    static _cloneNode(node) {

        let clone = Object.assign(Object.create(Object.getPrototypeOf(node)), node);

        clone._uuid = createUUID();

        switch (clone.category) {
            case COMPOSITE:
                let newChildren = [];
                for (let i = 0; i < clone.children.length; i++) {
                    newChildren.push(this._cloneNode(clone.children[i]));
                }
                clone.children = newChildren;
                break;
            case DECORATOR:
                clone.child = this._cloneNode(clone.children[0]);
                break;
        }

        return clone;
    }

    async tick() {

        this._tick = new Tick();
        this._tick.setOpenNodes(this._lastOpenNodes);
        this._lastResult = await this._tree._execute(this._blackboard, this._tick);
        this._lastOpenNodes = this._tick.getOpenNodes();

        // to make sure all are closed if no node is running
        if (this._lastResult !== RUNNING) {
            this._lastOpenNodes = [];
        }

        /*
        console.log("================")
        console.log(this._lastResult)
        console.log(this._tick._openNodes)
        */
    }

}