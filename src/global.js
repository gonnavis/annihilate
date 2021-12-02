let g = {}

// NOTE: collisionFilterGroup - must be powers of 2!
// NOTE: Start from 2 to prevent conflict with default value 1.
// NOTE: https://pmndrs.github.io/cannon-es/docs/classes/body.html
g.GROUP_SCENE = 2
g.GROUP_ROLE = 4
g.GROUP_ENEMY = 8
g.GROUP_ROLE_WEAPON = 16
g.GROUP_ENEMY_WEAPON = 32

g.getQueryStringByName = function (name) {
  var result = location.search.match(new RegExp('[?&]' + name + '=([^&]+)', 'i'))
  if (result == null || result.length < 1) {
    return ''
  }
  return result[1]
}

g.isAttack = g.getQueryStringByName('attack') === 'false' ? false : true
g.isDamage = g.getQueryStringByName('damage') === 'false' ? false : true

window.g = g
export { g }
