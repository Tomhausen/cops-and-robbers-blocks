function create_escape () {
    tilesAdvanced.swapAllTiles(assets.tile`open door`, assets.tile`closed door`)
    tiles.setTileAt(tiles.getTilesByType(assets.tile`closed door`)._pickRandom(), assets.tile`open door`)
}
scene.onPathCompletion(SpriteKind.Enemy, function (sprite, location) {
    idle_behaviour(sprite)
})
function idle_behaviour (guard: Sprite) {
    if (guard.vx != 0) {
        y_vel = randint(0, 1) * (speed * 2) - speed
        guard.setVelocity(0, y_vel)
    } else {
        x_vel = randint(0, 1) * (speed * 2) - speed
        guard.setVelocity(x_vel, 0)
    }
}
function alerted (guard: Sprite) {
    if (scene.spriteIsFollowingPath(guard)) {
        if (sprites.readDataString(guard, "colour") == "blue") {
            guard.image.replace(8, 2)
            sprites.setDataString(guard, "colour", "red")
        } else {
            guard.image.replace(2, 8)
            sprites.setDataString(guard, "colour", "blue")
        }
        guard.sayText("!")
    } else {
        guard.image.replace(2, 8)
        guard.sayText("")
    }
}
function convert_code (input2: string) {
    temp_value = input2
    while (temp_value.length < 4) {
        temp_value = "0" + temp_value
    }
    return temp_value
}
function follow_using_pathfinding (sprite: Sprite, target: Sprite, speed: number) {
    guard_pos = sprite.tilemapLocation()
    path = scene.aStar(guard_pos, target.tilemapLocation())
    scene.followPath(sprite, path, speed)
}
scene.onHitWall(SpriteKind.Enemy, function (sprite, location) {
    idle_behaviour(sprite)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`open door`, function (sprite, location) {
    if (opened_chest) {
        info.changeScoreBy(1000)
        sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
        music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.UntilDone)
        setup_level()
    }
})
function spawn_guard () {
    guard = sprites.create(assets.image`guard`, SpriteKind.Enemy)
    tiles.placeOnRandomTile(guard, assets.tile`guard spawn`)
    sprites.setDataBoolean(guard, "searching", false)
    sprites.setDataString(guard, "colour", "blue")
    idle_behaviour(guard)
}
function setup_level () {
    tiles.setCurrentTilemap(tilemap`level`)
    tiles.placeOnRandomTile(robber, assets.tile`open door`)
    for (let index = 0; index < randint(4, 8); index++) {
        spawn_guard()
    }
    tilesAdvanced.swapAllTiles(assets.tile`guard spawn`, assets.tile`floor`)
    opened_chest = false
    note = sprites.create(assets.image`note`, SpriteKind.Food)
    note.z = -1
    tiles.placeOnRandomTile(note, assets.tile`floor`)
    code = convert_code(convertToText(randint(0, 9999)))
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (robber, guard) {
	
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    robber.sayText(code, 100, false)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`chest`, function (robber, chest) {
    if (!(opened_chest)) {
        answer = convertToText(game.askForNumber("", 4))
        if (convert_code(answer) == code) {
            opened_chest = true
            info.changeScoreBy(1000)
            music.play(music.melodyPlayable(music.siren), music.PlaybackMode.UntilDone)
            create_escape()
        } else {
            tiles.placeOnTile(robber, robber.tilemapLocation())
        }
    }
})
function guard_behaviour (guard: Sprite) {
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
        col = robber.tilemapLocation().column
        row = robber.tilemapLocation().row
        path = scene.aStar(guard.tilemapLocation(), tiles.getTileLocation(col, row))
        scene.followPath(guard, path)
    }
}
let row = 0
let col = 0
let answer = ""
let code = ""
let note: Sprite = null
let guard: Sprite = null
let opened_chest = false
let path: tiles.Location[] = []
let guard_pos: tiles.Location = null
let temp_value = ""
let x_vel = 0
let y_vel = 0
let robber: Sprite = null
let speed = 0
speed = 30
robber = sprites.create(assets.image`robber`, SpriteKind.Player)
controller.moveSprite(robber)
scene.cameraFollowSprite(robber)
spriteutils.setConsoleOverlay(true)
setup_level()
game.onUpdate(function () {
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        guard_behaviour(value)
    }
})
game.onUpdateInterval(500, function () {
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        alerted(value)
    }
})
