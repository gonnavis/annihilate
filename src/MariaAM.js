
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
class StartPunchStart extends b3.Action {
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
      return b3.FAILURE;
    } else {
      tickResults.punchStart = true;
      return b3.RUNNING;
    }
  }
}
class StartIdle extends b3.Action {
  tick(tick) {
    const tickResults = tick.blackboard.get('tickResults');
    tickResults.startIdle = true;
    return b3.SUCCESS;
  }
}
class Idle extends b3.Action {
  tick(tick) {
    const localPlayer = tick.target;
    const tickResults = tick.blackboard.get('tickResults');
    if (localPlayer.isAnimFinished) {
      return b3.FAILURE;
    } else {
      tickResults.idle = true;
      return b3.RUNNING;
    }
  }
}

const tree = new b3.BehaviorTree();
tree.root = new b3.MemSequence({title:'root',children: [
  new Loading({title:'Loading',}),
  new b3.Runnor({title:'loaded',child:
    new b3.Priority({title:'base',children:[
      new b3.MemSequence({title:'punchStart',children:[
        new StartPunchStart({title:'StartPunchStart',}),
        new PunchStart({title:'PunchStart',}),
      ]}),
      new b3.MemSequence({title:'idle',children:[
        new StartIdle({title:'StartIdle'}),
        new Idle({title:'Idle'}),
      ]}),
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

  const setActions = () => {
    if (tickResults.punchStart && !lastFrameResults.punchStart) {
      // console.log('punchStart on');
      maria.oaction['punchStart'].timeScale = maria.attackSpeed
      maria.fadeToAction('punchStart')
    }
    if (!tickResults.punchStart && lastFrameResults.punchStart) {
      // console.log('punchStart off');
    }
    
    if (tickResults.idle && !lastFrameResults.idle) {
      // console.log('idle on');
      maria.oaction['idle'].timeScale = maria.attackSpeed
      maria.fadeToAction('idle', 2)
    }
    if (!tickResults.idle && lastFrameResults.idle) {
      // console.log('idle off');
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