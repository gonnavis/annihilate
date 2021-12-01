let g = {}

// Collision filter groups - must be powers of 2!
g.GROUP_SCENE = 1
g.GROUP_ROLE = 2
g.GROUP_ENEMY = 4
g.GROUP_ROLE_WEAPON = 8
g.GROUP_ENEMY_WEAPON = 16

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
