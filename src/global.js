let g = {}

// NOTE: collisionFilterGroup - must be powers of 2!
// NOTE: Start from 2 to prevent conflict with default value 1.
// NOTE: https://pmndrs.github.io/cannon-es/docs/classes/body.html
g.GROUP_SCENE = 2
g.GROUP_ROLE = 4
g.GROUP_ENEMY = 8
g.GROUP_ROLE_ATTACKER = 16
g.GROUP_ENEMY_ATTACKER = 32
g.GROUP_TRIGGER = 64
g.GROUP_ENEMY_SHIELD = 128
g.GROUP_NO_COLLIDE = 256
// g.GROUP_ENEMY_ATTACKER_REBOUNDABLE = 64 // Don't need.

g.MAX_DT = 1 / 60 // Max delta time.

g.getQueryStringByName = function (name) {
  var result = location.search.match(new RegExp('[?&]' + name + '=([^&]+)', 'i'))
  if (result == null || result.length < 1) {
    return ''
  }
  return result[1]
}

g.isAttack = g.getQueryStringByName('attack') === 'false' ? false : true
g.isDamage = g.getQueryStringByName('damage') === 'false' ? false : true
g.isOrbit = g.getQueryStringByName('orbit') === 'true' ? true : false
g.isEnemy = g.getQueryStringByName('enemy') === 'false' ? false : true

window.g = g
export { g }
