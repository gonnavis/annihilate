import Decorator from '../core/Decorator.js';
import {RUNNING, ERROR} from '../constants.js';

/**
 * The Runnor decorator always returning `RUNNING`.
 *
 * @module b3
 * @class Inverter
 * @extends Decorator
 **/

export default class Inverter extends Decorator {

  /**
   * Creates an instance of Inverter.
   * @param {Object} params
   * @param {BaseNode} params.child The child node.
   * @memberof Inverter
   */
  constructor({child = null} = {}){
    super({
      child,
      name: 'Inverter',
    });
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

    this.child._execute(tick);

    return RUNNING;
  }
};
