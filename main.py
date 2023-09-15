function follow_using_pathfinding (sprite: Sprite, target: Sprite, speed: number) {
    guard_pos = sprite.tilemapLocation()
    start_col = sprites.readDataNumber(sprite, "start_col")
    start_row = sprites.readDataNumber(sprite, "start_row")
    if (guard_pos.col == start_col && guard_pos.row == start_row) {
        return
    }
    sprites.setDataNumber(sprite, "start_col", guard_pos.col)
    sprites.setDataNumber(sprite, "start_row", guard_pos.row)
    path = scene.aStar(guard_pos, target.tilemapLocation())
    scene.followPath(sprite, path, speed)
}
function spawn_guard () {
    guard = sprites.create(assets.image`guard`, SpriteKind.Enemy)
    tiles.placeOnRandomTile(guard, assets.tile`guard spawn`)
    tiles.setTileAt(guard.tilemapLocation(), assets.tile`floor`)
    sprites.setDataBoolean(guard, "searching", false)
    sprites.setDataNumber(guard, "start_col", 0)
    sprites.setDataNumber(guard, "start_row", 0)
    idle_behaviour(guard, guard.tilemapLocation())
}
function setup_level () {
    tiles.setCurrentTilemap(tilemap`level`)
    tiles.placeOnRandomTile(robber, assets.tile`open door`)
    for (let index = 0; index < randint(4, 8); index++) {
        spawn_guard()
    }
    tilesAdvanced.swapAllTiles(sprites.background.autumn, sprites.background.autumn)
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (robber, guard) {
    game.over(false)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`chest`, function (robber, chest) {
    info.changeScoreBy(1000)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.UntilDone)
    setup_level()
})
function guard_behaviour (guard: Sprite) {
    let col: number;
let row: number;
let path2: tiles.Location[];
if (spriteutils.distanceBetween(guard, robber) > 100) {
        return
    }
    if (tilesAdvanced.checkLineOfSight(guard, robber)) {
        sprites.setDataBoolean(guard, "following", true)
        if (!(scene.spriteIsFollowingPath(guard))) {
            follow_using_pathfinding(guard, robber, speed)
        }
    } else if (sprites.readDataBoolean(guard, "following")) {
        sprites.setDataBoolean(guard, "following", false)
        col = robber.tilemapLocation().col
row = robber.tilemapLocation().row
        path2 = scene.aStar(guard.tilemapLocation(), tiles.getTileLocation(col, row))
        scene.followPath(guard, path2)
    }
}
let guard: Sprite = null
let path: tiles.Location[] = []
let start_row = 0
let start_col = 0
let guard_pos: tiles.Location = null
let robber: Sprite = null
let speed = 0
speed = 30
robber = sprites.create(assets.image`robber`, SpriteKind.Player)
controller.moveSprite(robber)
scene.cameraFollowSprite(robber)
setup_level()
game.onUpdate(function () {
    for (let guard2 of sprites.allOfKind(SpriteKind.Enemy)) {
        guard_behaviour(guard2)
    }
})
