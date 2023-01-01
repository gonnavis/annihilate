import Decorator from '../core/Decorator.js';
import {SUCCESS, ERROR, FAILURE} from '../constants.js';

/**
 * RepeatUntilSuccess is a decorator that repeats the tick signal until the
 * node child returns `SUCCESS`, `RUNNING` or `ERROR`. Optionally, a maximum
 * number of repetitions can be defined.
 *
 * @module b3
 * @class RepeatUntilSuccess
 * @extends Decorator
 **/

export default class RepeatUntilSuccess extends Decorator {

  /**
   * Creates an instance of RepeatUntilSuccess.
   *
   * - **maxLoop** (*Integer*) Maximum number of repetitions. Default to -1 (infinite).
   * - **child** (*BaseNode*) The child node.
   *
   * @param {Object} params Object with parameters.
   * @param {Number} params.maxLoop Maximum number of repetitions. Default to -1 (infinite).
   * @param {BaseNode} params.child The child node.
   * @memberof RepeatUntilSuccess
   **/
  constructor({maxLoop = -1, child = null} = {}) {
    super({
      child,
      name: 'RepeatUntilSuccess',
      title: 'Repeat Until Success',
      properties: {maxLoop: -1},
    });

    this.maxLoop = maxLoop;
  }

  /**
   * Open method.
   * @method open
   * @param {Tick} tick A tick instance.
   **/
  open(tick) {
    tick.blackboard.set('i', 0, tick.tree.id, this.id);
  }

  /**
   * Tick method.
   * @method tick
   * @param {Tick} tick A tick instance.
   * @return {Constant} A state constant.
   **/
  tick(tick) {
    if (!this.child) {
      return ERROR;
    }

    var i = tick.blackboard.get('i', tick.tree.id, this.id);
    var status = ERROR;

    while (this.maxLoop < 0 || i < this.maxLoop) {
      status = this.child._execute(tick);

      if (status === FAILURE) {
        i++;
      } else {
        break;
      }
    }

    i = tick.blackboard.set('i', i, tick.tree.id, this.id);
    return status;
  }
};