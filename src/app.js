import Enemy from './objects/enemy';
import Player from './objects/player';
import Arrow from './objects/arrow';
import MousePointer from './objects/mousepointer';
import {InputHandler} from './objects/commands';
import Collider from './collider';
import {getMusicFiles} from './utils';

const scale = 2.0;

var game = new Phaser.Game(960 / scale, 640 / scale, Phaser.CANVAS, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

// make debugging easier
window.game = game;

function preload() {
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('terrain_atlas', 'assets/terrain_atlas.png');
    game.load.audio('rain-sound', 'assets/music/rain.mp3');
    game.load.image('rain', 'assets/rain.png');
    game.load.image('youdied', 'assets/youdied.png');

    MousePointer.preload();
    Player.preload();
    Enemy.preload(game);
    Arrow.preload(game);
}


function create() {
    // add music
    var music = game.add.audio('rain-sound');
    music.play();
    music.volume = 0.4;


    game.time.advancedTiming = true;

    // set scale
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.setUserScale(scale, scale);

    // enable crisp rendering
    game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(game.canvas);

    //game.add.tileSprite(0, 0, 1920, 1920, 'background');
    game.map = game.add.tilemap('map');
    game.map.addTilesetImage('terrain_atlas', 'terrain_atlas');

    const TILE_SIZE = 20;
    var worldWidth = game.map.width * game.map.tileWidth;
    var worldHeight = game.map.height * game.map.tileHeight;
    game.world.setBounds(0, 0, worldWidth, worldHeight);

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.collider = new Collider(game);

    setupMap(game.map);
    game.surpriseSpawned = false;
    game.physics.p2.updateBoundsCollisionGroup();
    game.enemies = [];

    // add enemies
    for (const [x, y] of [
        [ 80, 550],
        [ 70, 540],

        [460, 765],
        [370, 575],

        [300, 1000],

        [ 25, 1005],
        [ 55,  985],
        [100, 1030],

        [165, 375],
        [200, 375],
        [275, 365],

        [720, 55],

        [184, 76],
        [274, 44],
        [210, 130],
        [268, 94],
        [370, 46],

        [944, 654],
        [964, 686],
        [938, 700],
        [956, 774],
        [906, 806],
        [900, 740],
        [904, 772],
        [856, 756],
        [950, 900],
        [554, 1034],
        [582, 1062],
        [634, 1010],
        [718, 1124],
        [894, 1072],

        [1260, 858],
        [1326, 804],
        [1356, 890],
        [1656, 914],
        [1648, 600],
        [1710, 636],
        [1756, 676],
        [1742, 594],
        [1694, 600],
        [1722, 532],
        [1804, 574],
        [1838, 656],
        [1814, 408],
        [1494, 484],
        [1470, 134],
        [1496, 156],
        [1536, 130],
        [1512, 92],
        [728, 352],
        [922, 358],
        [1022, 346],
        [1074, 384],
        [942, 408],
        [944, 524],
    ]) {
        game.add.existing(new Enemy(game, x, y));
    }

    game.player = new Player(game, 175, 780);
    game.add.existing(game.player);

    //  Notice that the sprite doesn't have any momentum at all,
    //  it's all just set by the camera follow type.
    //  0.1 is the amount of linear interpolation to use.
    //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
    game.camera.follow(game.player.cameraTarget, Phaser.Camera.FOLLOW_LOCKON, 0.2, 0.2);

    game.input.onDown.add(sendMouseDownCommand, this);
    game.input.onUp.add(sendMouseUpCommand, this);
    game.add.existing(new MousePointer(game, 0, 0));

    // RAIN

    game.emitter = game.add.emitter(0, 0, 100);

    game.emitter.fixedToCamera = true;

    game.emitter.width = game.width * scale;

    //game.emitter.angle = -30; // uncomment to set an angle for the rain.

    game.emitter.makeParticles('rain');
    game.emitter.gravity = 500;

    game.emitter.minParticleScale = 1;
    game.emitter.maxParticleScale = 1;

    game.emitter.setYSpeed(60, 90);
    game.emitter.setXSpeed(6, 16);

    game.emitter.minRotation = -8;
    game.emitter.maxRotation = -8;

    game.emitter.setAlpha(0.5, 0.1, 2000, Phaser.Easing.Bounce.In, false);

    game.emitter.start(false, 1600, 2, 0);

    game.showGameOver = showGameOver;
}

function update() {
    game.player.sendCommands(InputHandler.getKeyboardCommands());
    game.player.sendCommand(InputHandler.getMousePointerCommand());

    if (game.player.physicsSprite.x > 620 && !game.surpriseSpawned) {
        game.surpriseSpawned = true;
        for (const [x, y] of [
            [550, 700],
            [550, 710],
            [550, 720],
            [540, 705],
            [530, 705],
        ]) {
            game.add.existing(new Enemy(game, x, y));
        }
    }
}


function sendMouseDownCommand() {
    let command = InputHandler.getMouseDownCommand();
    if (command) {
        game.player.sendCommand(command);
    }
}


function sendMouseUpCommand() {
    let command = InputHandler.getMouseUpCommand();
    if (command) {
        game.player.sendCommand(command);
    }
}


function render() {
    //game.debug.text('FPS: ' + (game.time.fps || '--') , 32, 16, "#ffff00");
//    game.debug.cameraInfo(game.camera, 32, 32);
}


function setupMap(map) {
    map.game.layers = {};

    map.layers.forEach(function(layer) {
        var attr = `${layer}Layer`;
        let tileLayer = map.game.layers[layer.name] = map.createLayer(layer.name);

        var collisionTileIndexes = new Set();
        if (layer.properties.collision) {
            layer.data.forEach((row) => {
                row.forEach((tile) => {
                    if (tile.index > 0) {
                        collisionTileIndexes.add(tile.index);
                    }
                });
            });
        }
        if (collisionTileIndexes.size) {
            collisionTileIndexes.forEach((idx) => {
                game.map.setCollision(idx, true, map.game.layers[layer.name]);
            });
        }
        var bodies = map.game.physics.p2.convertTilemap(map, tileLayer);
        for (let body of bodies) {
            //body.debug = true;  // XXX: show water collision shapes
            body.setCollisionGroup(game.collider.STATIC_COLLISION_GROUP);
            body.collides([
                game.collider.PLAYER_COLLISION_GROUP,
                game.collider.ENEMY_COLLISION_GROUP,
            ]);
        }
    });
}


function showGameOver() {
    let centerX = game.camera.x + game.camera.width / 2;
    let centerY = game.camera.y + game.camera.height / 2;

    let screen = game.add.tileSprite(centerX, centerY, 500, 500, 'youdied');
    screen.anchor.setTo(0.5, 0.5);
    screen.scale.setTo(0.8, 0.8);

    game.input.keyboard.onPressCallback = function(key){
        if (key.toLowerCase() === 'r') {
            game.state.restart();
        }
    };
}
