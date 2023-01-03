
import * as b3 from '../lib/behavior3js/index.js'

// note: tickResults will all reset to false after every tick, so don't need set `tickResults.xxx = false`.

class Loading extends b3.Action {
  tick(tick) {
    if (tick.blackboard.get('loaded')) {
      return b3.SUCCESS;
    } else {
      return b3.RUNNING;
    }
  }
}
class TriggerPunchStart extends b3.Action {
  tick(tick) {
    const tickResults = tick.blackboard.get('tickResults');
    if (window.tickKey.KeyJ) {
      tickResults.punchStart = true;
      return b3.SUCCESS;
    } else {
      return b3.FAILURE;
    }
  }
}
class PunchStart extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      return b3.SUCCESS;
    } else {
      tickResults.punchStart = true;
      return b3.RUNNING;
    }
  }
}
class Punch extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      // console.log('SUCCESS Punch');
      return b3.SUCCESS;
    } else {
      tickResults.punch = true;
      // console.log('RUNNING Punch');
      return b3.RUNNING;
    }
  }
}
class PrepareFist extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      return b3.SUCCESS;
    } else {
      tickResults.punch = true;
      return b3.RUNNING;
    }
  }
}
class TriggerFistStart extends b3.Action {
  tick(tick) {
    const tickResults = tick.blackboard.get('tickResults');
    if (window.tickKey.KeyJ) {
      tickResults.fistStart = true;
      // console.log('SUCCESS TriggerFistStart');
      return b3.SUCCESS;
    } else {
      return b3.FAILURE;
    }
  }
}
class FistStart extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      return b3.SUCCESS;
    } else {
      tickResults.fistStart = true;
      return b3.RUNNING;
    }
  }
}
class Fist extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      // console.log('SUCCESS Fist');
      return b3.SUCCESS;
    } else {
      tickResults.fist = true;
      // console.log('RUNNING Fist');
      return b3.RUNNING;
    }
  }
}
class PrepareStrike extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      return b3.SUCCESS;
    } else {
      tickResults.fist = true;
      return b3.RUNNING;
    }
  }
}
class TriggerStrikeStart extends b3.Action {
  tick(tick) {
    const tickResults = tick.blackboard.get('tickResults');
    if (window.tickKey.KeyJ) {
      tickResults.strikeStart = true;
      // console.log('SUCCESS TriggerStrikeStart');
      return b3.SUCCESS;
    } else {
      return b3.FAILURE;
    }
  }
}
class StrikeStart extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      return b3.SUCCESS;
    } else {
      tickResults.strikeStart = true;
      return b3.RUNNING;
    }
  }
}
class Strike extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      // console.log('SUCCESS Strike');
      return b3.SUCCESS;
    } else {
      tickResults.strike = true;
      // console.log('RUNNING Strike');
      return b3.RUNNING;
    }
  }
}
class StrikeEnd extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      // console.log('SUCCESS StrikeEnd');
      return b3.SUCCESS;
    } else {
      tickResults.strikeEnd = true;
      // console.log('RUNNING StrikeEnd');
      return b3.RUNNING;
    }
  }
}
class TriggerIdle extends b3.Action {
  tick(tick) {
    const tickResults = tick.blackboard.get('tickResults');
    tickResults.idle = true;
    return b3.SUCCESS;
  }
}
class Run extends b3.Action {
  tick(tick) {
    const tickResults = tick.blackboard.get('tickResults');
    if (window.allKey.KeyW || window.allKey.KeyS || window.allKey.KeyA || window.allKey.KeyD) {
      tickResults.run = true;
      return b3.SUCCESS;
    } else {
      return b3.FAILURE;
    }
  }
}
// class Idle extends b3.Action {
//   tick(tick) {
//     const localPlayer = tick.target;
//     const tickResults = tick.blackboard.get('tickResults');
//     if (localPlayer.isAnimFinished) {
//       return b3.SUCCESS;
//     } else {
//       tickResults.idle = true;
//       return b3.RUNNING;
//     }
//   }
// }
class Idle extends b3.Action {
  tick(tick) {
    // const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    tickResults.idle = true;
    return b3.SUCCESS;
  }
}
class WaitOneFrame extends b3.Action {
  tick(tick) {
    const frameCount = tick.blackboard.get('frameCount');
    const thisFrameCount = tick.blackboard.get('frameCount', tick.tree.id, this.id);
    const tickResults = tick.blackboard.get('tickResults');
    if (!thisFrameCount) {
      tick.blackboard.set('frameCount', frameCount, tick.tree.id, this.id);
    }
    if (frameCount > thisFrameCount) {
      tick.blackboard.set('frameCount', undefined, tick.tree.id, this.id);
      // console.log('SUCCESS WaitOneFrame');
      return b3.SUCCESS
    } else {
      if (this.setTrueKey) tickResults[this.setTrueKey] = true;
      // console.log('RUNNING WaitOneFrame');
      return b3.RUNNING
    }
  }
}

const tree = new b3.BehaviorTree();
tree.root = new b3.MemSequence({title:'root',children: [
  new Loading({title:'Loading',}),
  new b3.Runnor({title:'loaded',child:
    new b3.Priority({title:'base',children:[
      new b3.MemSequence({title:'punchStart',children:[
        new TriggerPunchStart({title:'TriggerPunchStart',}),
        new PunchStart({title:'PunchStart'}),
        new WaitOneFrame({title:'WaitOneFrame',setTrueKey:'punch'}),
        new b3.Priority({children:[
          new b3.MemSequence({children:[
            new TriggerFistStart({title:'TriggerFistStart'}),
            new PrepareFist({title:'PrepareFist'}),
            new WaitOneFrame({title:'WaitOneFrame',setTrueKey:'fistStart'}),
            new FistStart({title:'FistStart'}),
            new WaitOneFrame({title:'WaitOneFrame',setTrueKey:'fist'}),
            new b3.Priority({children:[
              new b3.MemSequence({children:[
                new TriggerStrikeStart({title:'TriggerStrikeStart'}),
                new PrepareStrike({title:'PrepareStrike'}),
                new WaitOneFrame({title:'WaitOneFrame',setTrueKey:'strikeStart'}),
                new StrikeStart({title:'StrikeStart'}),
                new WaitOneFrame({title:'WaitOneFrame',setTrueKey:'strike'}),
                new Strike({title:'Strike'}),
                new WaitOneFrame({title:'WaitOneFrame',setTrueKey:'strikeEnd'}),
                new StrikeEnd({title:'StrikeEnd'}),
              ]}),
              new Fist({title:'Fist'}),
            ]}),
          ]}),
          new Punch({title:'Punch'}),
        ]}),
      ]}),
      new Run({title:'Run'}),
      // new b3.MemSequence({title:'idle',children:[
      //   new TriggerIdle({title:'TriggerIdle'}),
      //   new Idle({title:'Idle'}),
      // ]}),
      new Idle({title:'Idle'}),
    ]}),
  }), // end: loaded
]}); // end: root

const clearTickResults = (localPlayer, blackboard) => {
  const tickResults = blackboard.get('tickResults');
  for (const key in tickResults) {
    tickResults[key] = false;
  }
}

const preFrameSettings = (localPlayer, blackboard, timestamp) => {
  // blackboard.set('now', timestamp);
}

const postFrameSettings = (localPlayer, blackboard) => {
  const tickResults = blackboard.get('tickResults');
  const lastFrameResults = blackboard.get('lastFrameResults');
  const frameTryActions = blackboard.get('frameTryActions');
  const longTryActions = blackboard.get('longTryActions');

  /*** test ***/
  // console.log(tickResults.punchStart, tickResults.punch)
  const actionTypes = [];
  for (const key in tickResults) {
    const value = tickResults[key];
    if (value === true) actionTypes.push(key)
  }
  // console.log(actionTypes.join(','));
  // console.log(actionTypes.length, actionTypes.join(','));
  // console.log(actionTypes);
  /*** end test ***/

  const setActions = () => {

    if (tickResults.punchStart && !lastFrameResults.punchStart) {
      // console.log('punchStart on');
      maria.oaction['punchStart'].timeScale = maria.attackSpeed
      maria.fadeToAction('punchStart')
    }
    if (!tickResults.punchStart && lastFrameResults.punchStart) {
      // console.log('punchStart off');
    }

    if (tickResults.punch && !lastFrameResults.punch) {
      // console.log('punch on');
      maria.oaction['punch'].timeScale = maria.attackSpeed
      maria.fadeToAction('punch', 0)
    }
    if (!tickResults.punch && lastFrameResults.punch) {
      // console.log('punch off');
    }
    
    if (tickResults.fistStart && !lastFrameResults.fistStart) {
      // console.log('fistStart on');
      maria.oaction['fistStart'].timeScale = maria.attackSpeed
      maria.fadeToAction('fistStart')
    }
    if (!tickResults.fistStart && lastFrameResults.fistStart) {
      // console.log('fistStart off');
    }

    if (tickResults.fist && !lastFrameResults.fist) {
      // console.log('fist on');
      maria.oaction['fist'].timeScale = maria.attackSpeed
      maria.fadeToAction('fist', 0)
    }
    if (!tickResults.fist && lastFrameResults.fist) {
      // console.log('fist off');
    }
    
    if (tickResults.strikeStart && !lastFrameResults.strikeStart) {
      // console.log('strikeStart on');
      maria.oaction['strikeStart'].timeScale = maria.attackSpeed
      maria.fadeToAction('strikeStart')
    }
    if (!tickResults.strikeStart && lastFrameResults.strikeStart) {
      // console.log('strikeStart off');
    }

    if (tickResults.strike && !lastFrameResults.strike) {
      // console.log('strike on');
      maria.oaction['strike'].timeScale = maria.attackSpeed
      maria.fadeToAction('strike', 0)
    }
    if (!tickResults.strike && lastFrameResults.strike) {
      // console.log('strike off');
    }

    if (tickResults.strikeEnd && !lastFrameResults.strikeEnd) {
      // console.log('strikeEnd on');
      maria.oaction['strikeEnd'].timeScale = maria.attackSpeed
      maria.fadeToAction('strikeEnd', 0)
    }
    if (!tickResults.strikeEnd && lastFrameResults.strikeEnd) {
      // console.log('strikeEnd off');
    }
    
    if (tickResults.idle && !lastFrameResults.idle) {
      // console.log('idle on');
      maria.oaction['idle'].timeScale = maria.attackSpeed
      maria.fadeToAction('idle')
    }
    if (!tickResults.idle && lastFrameResults.idle) {
      // console.log('idle off');
    }

    if (tickResults.run) {
      const directionLengthSq = maria.direction.lengthSq()
      if (directionLengthSq > 0) {
        // change facing
        maria.facing.copy(maria.direction)
      } // end if here to set velocity 0 when stop, but because linearDamping not 1, will no obvious effect.
      maria.mesh.rotation.y = -maria.facing.angle() + Math.PI / 2

      maria.body.position.x += maria.direction.x
      maria.body.position.z += maria.direction.y
    }
    if (tickResults.run && !lastFrameResults.run) {
      // console.log('run on');
      maria.fadeToAction('running');
    }
    if (!tickResults.run && lastFrameResults.run) {
      // console.log('run off');
    }
  }
  setActions();

  const setLastFrameResults = () => {
    const tickResults = blackboard.get('tickResults');
    const lastFrameResults = blackboard.get('lastFrameResults');
    for (const key in tickResults) {
      lastFrameResults[key] = tickResults[key];
    }
  }
  setLastFrameResults();

  const resetFrameInfos = () => {
    const frameTryActions = blackboard.get('frameTryActions');
    for (const key in frameTryActions) {
      frameTryActions[key] = null;
    }
    const frameTryStopActions = blackboard.get('frameTryStopActions');
    for (const key in frameTryStopActions) {
      frameTryStopActions[key] = null;
    }
  }
  resetFrameInfos();

  blackboard.set('frameCount', blackboard.get('frameCount') + 1);
}

class ActionsManager {
  constructor(localPlayer) {
    this.localPlayer = localPlayer;
    this.blackboard = new b3.Blackboard();
    this.blackboard.set('tickResults', {});
    this.blackboard.set('lastFrameResults', {});
    this.blackboard.set('frameTryActions', {});
    this.blackboard.set('longTryActions', {});
    this.blackboard.set('frameTryStopActions', {});
    this.blackboard.set('frameCount', 0);
    this.blackboard.set('loaded', true);
  }

  get() {
    return this.blackboard.get(...arguments);
  }

  set() {
    return this.blackboard.set(...arguments);
  }

  tryAddAction(action, isLong = false) {
    if (isLong) {
      const longTryActions = this.blackboard.get('longTryActions');
      longTryActions[action.type] = action;
      const frameTryActions = this.blackboard.get('frameTryActions');
      frameTryActions[action.type] = action; // note: long try also trigger frame try.
    } else {
      const frameTryActions = this.blackboard.get('frameTryActions');
      frameTryActions[action.type] = action;
    }
  }

  tryRemoveAction(actionType, isLong = false) {
    if (isLong) {
      const longTryActions = this.blackboard.get('longTryActions');
      longTryActions[actionType] = null;
    } else {
      const frameTryStopActions = this.blackboard.get('frameTryStopActions');
      frameTryStopActions[actionType] = true;
    }
  }

  isLongTrying(actionType) {
    const longTryActions = this.blackboard.get('longTryActions');
    return !!longTryActions[actionType];
  }

  update(timestamp) {
    preFrameSettings(this.localPlayer, this.blackboard, timestamp);
    tree.tick(this.localPlayer, this.blackboard);
    clearTickResults(this.localPlayer, this.blackboard);
    tree.tick(this.localPlayer, this.blackboard); // note: reTick/doubleTick in order to switch from low prio action to high prio action immediately, prevent one frame empty state/action.
    postFrameSettings(this.localPlayer, this.blackboard);
    clearTickResults(this.localPlayer, this.blackboard);
  }
}

export {ActionsManager};