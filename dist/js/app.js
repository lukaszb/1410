/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _enemy = __webpack_require__(1);

	var _enemy2 = _interopRequireDefault(_enemy);

	var _player = __webpack_require__(3);

	var _player2 = _interopRequireDefault(_player);

	var _arrow = __webpack_require__(6);

	var _arrow2 = _interopRequireDefault(_arrow);

	var _mousepointer = __webpack_require__(7);

	var _mousepointer2 = _interopRequireDefault(_mousepointer);

	var _commands = __webpack_require__(4);

	var _collider = __webpack_require__(8);

	var _collider2 = _interopRequireDefault(_collider);

	var _utils = __webpack_require__(2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var scale = 2.0;

	var game = new Phaser.Game(960 / scale, 640 / scale, Phaser.CANVAS, 'game', {
	    preload: preload,
	    create: create,
	    update: update,
	    render: render
	});

	// make debugging easier
	window.game = game;

	function preload() {
	    game.load.image('background', 'assets/tests/debug-grid-1920x1920.png');
	    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
	    game.load.image('terrain_atlas', 'assets/terrain_atlas.png');
	    game.load.audio('rain-sound', 'assets/music/rain.mp3');
	    game.load.image('rain', 'assets/rain.png');
	    game.load.image('youdied', 'assets/youdied.png');

	    _mousepointer2.default.preload();
	    _player2.default.preload();
	    _enemy2.default.preload(game);
	    _arrow2.default.preload(game);
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

	    var TILE_SIZE = 20;
	    var worldWidth = game.map.width * game.map.tileWidth;
	    var worldHeight = game.map.height * game.map.tileHeight;
	    game.world.setBounds(0, 0, worldWidth, worldHeight);

	    game.physics.startSystem(Phaser.Physics.P2JS);
	    game.physics.p2.setImpactEvents(true);
	    game.collider = new _collider2.default(game);

	    setupMap(game.map);
	    game.surpriseSpawned = false;
	    game.physics.p2.updateBoundsCollisionGroup();
	    game.enemies = [];

	    // add enemies
	    var _arr = [[80, 550], [70, 540], [460, 765], [370, 575], [300, 1000], [25, 1005], [55, 985], [100, 1030], [165, 375], [200, 375], [275, 365], [720, 55], [184, 76], [274, 44], [210, 130], [268, 94], [370, 46], [944, 654], [964, 686], [938, 700], [956, 774], [906, 806], [900, 740], [904, 772], [856, 756], [950, 900], [554, 1034], [582, 1062], [634, 1010], [718, 1124], [894, 1072], [1260, 858], [1326, 804], [1356, 890], [1656, 914], [1648, 600], [1710, 636], [1756, 676], [1742, 594], [1694, 600], [1722, 532], [1804, 574], [1838, 656], [1814, 408], [1494, 484], [1470, 134], [1496, 156], [1536, 130], [1512, 92], [728, 352], [922, 358], [1022, 346], [1074, 384], [942, 408], [944, 524]];
	    for (var _i = 0; _i < _arr.length; _i++) {
	        var _arr$_i = _slicedToArray(_arr[_i], 2),
	            x = _arr$_i[0],
	            y = _arr$_i[1];

	        game.add.existing(new _enemy2.default(game, x, y));
	    }

	    game.player = new _player2.default(game, 175, 780);
	    game.add.existing(game.player);

	    //  Notice that the sprite doesn't have any momentum at all,
	    //  it's all just set by the camera follow type.
	    //  0.1 is the amount of linear interpolation to use.
	    //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
	    game.camera.follow(game.player.cameraTarget, Phaser.Camera.FOLLOW_LOCKON, 0.2, 0.2);

	    game.input.onDown.add(sendMouseDownCommand, this);
	    game.input.onUp.add(sendMouseUpCommand, this);
	    game.add.existing(new _mousepointer2.default(game, 0, 0));

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
	    game.player.sendCommands(_commands.InputHandler.getKeyboardCommands());
	    game.player.sendCommand(_commands.InputHandler.getMousePointerCommand());

	    if (game.player.physicsSprite.x > 620 && !game.surpriseSpawned) {
	        game.surpriseSpawned = true;
	        var _arr2 = [[550, 700], [550, 710], [550, 720], [540, 705], [530, 705]];
	        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
	            var _arr2$_i = _slicedToArray(_arr2[_i2], 2),
	                x = _arr2$_i[0],
	                y = _arr2$_i[1];

	            game.add.existing(new _enemy2.default(game, x, y));
	        }
	    }
	}

	function sendMouseDownCommand() {
	    var command = _commands.InputHandler.getMouseDownCommand();
	    if (command) {
	        game.player.sendCommand(command);
	    }
	}

	function sendMouseUpCommand() {
	    var command = _commands.InputHandler.getMouseUpCommand();
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

	    map.layers.forEach(function (layer) {
	        var attr = layer + 'Layer';
	        var tileLayer = map.game.layers[layer.name] = map.createLayer(layer.name);

	        var collisionTileIndexes = new Set();
	        if (layer.properties.collision) {
	            layer.data.forEach(function (row) {
	                row.forEach(function (tile) {
	                    if (tile.index > 0) {
	                        collisionTileIndexes.add(tile.index);
	                    }
	                });
	            });
	        }
	        if (collisionTileIndexes.size) {
	            collisionTileIndexes.forEach(function (idx) {
	                game.map.setCollision(idx, true, map.game.layers[layer.name]);
	            });
	        }
	        var bodies = map.game.physics.p2.convertTilemap(map, tileLayer);
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = bodies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var body = _step.value;

	                //body.debug = true;  // XXX: show water collision shapes
	                body.setCollisionGroup(game.collider.STATIC_COLLISION_GROUP);
	                body.collides([game.collider.PLAYER_COLLISION_GROUP, game.collider.ENEMY_COLLISION_GROUP]);
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                    _iterator.return();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }
	    });
	}

	function showGameOver() {
	    var centerX = game.camera.x + game.camera.width / 2;
	    var centerY = game.camera.y + game.camera.height / 2;

	    var screen = game.add.tileSprite(centerX, centerY, 500, 500, 'youdied');
	    screen.anchor.setTo(0.5, 0.5);
	    screen.scale.setTo(0.8, 0.8);

	    game.input.keyboard.onPressCallback = function (key) {
	        if (key.toLowerCase() === 'r') {
	            game.state.restart();
	        }
	    };
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var assetKeys = {
	    IDLE: 'skeleton-idle',
	    RUN: 'skeleton-running',
	    ATTACK: 'skeleton-attack',
	    SHADOW: 'skeleton-shadow',
	    DEATH: 'skeleton-death'
	};

	var hitSounds = void 0;
	var deathSounds = void 0;
	var attackSound = void 0;

	var Enemy = function (_Phaser$Sprite) {
	    _inherits(Enemy, _Phaser$Sprite);

	    _createClass(Enemy, null, [{
	        key: 'preload',
	        value: function preload(game) {
	            game.load.spritesheet(assetKeys.RUN, 'assets/skeleton-run.png', 50, 50);
	            game.load.spritesheet(assetKeys.IDLE, 'assets/skeleton-idle.png', 50, 50);
	            game.load.spritesheet(assetKeys.ATTACK, 'assets/skeleton-attack.png', 50, 50);
	            game.load.spritesheet(assetKeys.DEATH, 'assets/skeleton-death.png', 50, 50);
	            game.load.spritesheet(assetKeys.SHADOW, 'assets/shadow.png', 50, 50);
	            game.load.image('bones', 'assets/pixel.png');

	            game.load.physics('skeletonPhysics', 'assets/shapes.json');
	            game.load.audio('enemy-hit1', (0, _utils.getSoundFiles)('hit1'));
	            game.load.audio('enemy-hit2', (0, _utils.getSoundFiles)('hit2'));
	            game.load.audio('enemy-hit3', (0, _utils.getSoundFiles)('hit3'));
	            game.load.audio('enemy-death1', (0, _utils.getSoundFiles)('skeleton_death'));
	            game.load.audio('enemy-death2', (0, _utils.getSoundFiles)('skeleton_death2'));
	            game.load.audio('enemy-sword', (0, _utils.getSoundFiles)('swish1'));
	        }
	    }]);

	    function Enemy(game, x, y) {
	        _classCallCheck(this, Enemy);

	        var _this = _possibleConstructorReturn(this, (Enemy.__proto__ || Object.getPrototypeOf(Enemy)).call(this, game, x, y, assetKeys.IDLE));

	        _this.health = _this.maxHealth = 5;
	        _this.speed = 50 + Math.random() * 50 | 0;
	        _this.arrows = [];

	        _this.shadow = game.add.existing(new Phaser.Sprite(game, x, y, assetKeys.SHADOW));
	        _this.shadow.anchor.x = 0.5;
	        _this.shadow.anchor.y = 0.5;

	        game.physics.p2.enable(_this);
	        _this.body.clearShapes();
	        _this.body.loadPolygon('skeletonPhysics', 'skeleton-running');
	        _this.body.fixedRotation = true;
	        _this.body.setCollisionGroup(game.collider.ENEMY_COLLISION_GROUP);
	        _this.body.collides([game.collider.STATIC_COLLISION_GROUP, game.collider.PLAYER_COLLISION_GROUP, game.collider.ENEMY_COLLISION_GROUP, game.collider.ARROW_COLLISION_GROUP]);

	        _this.setupAnimations();

	        /* particles */
	        _this.emitter = game.add.emitter(0, 0, 100);

	        _this.emitter.makeParticles('bones');
	        _this.emitter.gravity = 200;

	        if (!hitSounds) {
	            hitSounds = [game.add.audio('enemy-hit1'), game.add.audio('enemy-hit2'), game.add.audio('enemy-hit3')];
	        }

	        if (!deathSounds) {
	            deathSounds = [game.add.audio('enemy-death1'), game.add.audio('enemy-death2')];
	        }

	        // hitbox
	        _this.hitbox = new Phaser.Sprite(game, 0, 0, null);
	        game.physics.p2.enable(_this.hitbox);
	        game.add.existing(_this.hitbox);
	        _this.hitbox.body.clearShapes();
	        _this.hitbox.body.addCircle(14, 0, -10);
	        _this.hitbox.body.setCollisionGroup(game.collider.ENEMY_SWORD_ATTACK_COLLISION_GROUP);
	        _this.hitbox.body.collides([game.collider.PLAYER_COLLISION_GROUP], _this.hitPlayer.bind(_this));

	        _this.setState(assetKeys.IDLE);
	        _this.wasAttacked = false;
	        game.enemies.push(_this);
	        return _this;
	    }

	    _createClass(Enemy, [{
	        key: 'update',
	        value: function update() {
	            var _this2 = this;

	            this.updateShadowPosition();
	            if (this.alive) {
	                this.updateHitbox();
	            }

	            if (!this.alive) return;

	            var playerCenter = new Phaser.Point(game.player.physicsSprite.position.x, game.player.physicsSprite.position.y + 25);
	            var vector = Phaser.Point.subtract(this.position, playerCenter);
	            var distance = vector.distance(new Phaser.Point());

	            var tolerance = 1;
	            var shouldFaceLeft = vector.x > tolerance;
	            if (shouldFaceLeft) {
	                this.scale.x = 1;
	            } else {
	                this.scale.x = -1;
	            }

	            var closeDistance = 30;
	            var sightDistance = 210;
	            this.wasAttacked = this.wasAttacked || this.health < this.maxHealth;

	            var vx = 0;
	            var vy = 0;

	            if (distance < closeDistance) {
	                this.setState(assetKeys.ATTACK);
	            } else if (distance <= sightDistance || this.wasAttacked) {
	                this.setState(assetKeys.RUN);
	                var normal = vector.normalize();
	                vx = this.speed * -normal.x;
	                vy = this.speed * -normal.y;
	            } else {
	                this.setState(assetKeys.IDLE);
	            }

	            var inertia = 0.5;
	            var body = this.body;
	            body.velocity.x = 0 | inertia * body.velocity.x + (1 - inertia) * vx;
	            body.velocity.y = 0 | inertia * body.velocity.y + (1 - inertia) * vy;

	            if (this.arrows.length > 0) {
	                (function () {
	                    var p1 = _this2.previousPosition;
	                    var p2 = _this2.position;

	                    var dx = p2.x - p1.x;
	                    var dy = p2.y - p1.y;

	                    _this2.arrows.forEach(function (arrow) {
	                        arrow.x += dx;
	                        arrow.y += dy;
	                    });
	                })();
	            }
	        }
	    }, {
	        key: 'updateShadowPosition',
	        value: function updateShadowPosition() {
	            this.shadow.x = this.x;
	            this.shadow.y = this.y + 22;
	        }
	    }, {
	        key: 'updateHitbox',
	        value: function updateHitbox() {
	            var pos = this.getHitboxPosition();
	            this.hitbox.body.x = pos.x;
	            this.hitbox.body.y = pos.y;
	        }
	    }, {
	        key: 'particleBurst',
	        value: function particleBurst(pointer) {

	            // draw area where particles are displayed
	            var poly = new Phaser.Polygon();
	            poly.setTo([new Phaser.Point(75, -50), new Phaser.Point(75, 15), new Phaser.Point(-75, 15), new Phaser.Point(-75, -50)]);
	            this.particleArea = game.add.graphics(pointer.x, pointer.y);
	            this.particleArea.beginFill(0x000000);
	            this.particleArea.drawPolygon(poly.points);
	            this.particleArea.endFill();

	            if (this.emitter.alive || this.emitter) {
	                //destroy prevously rendered emitter if exist
	                this.emitter.destroy();
	                this.emitter = game.add.emitter(0, 20, 38);
	                this.emitter.makeParticles('bones');
	            }

	            this.emitter.x = pointer.x;
	            this.emitter.y = pointer.y;
	            this.emitter.area = new Phaser.Rectangle(pointer.x - 25, pointer.y - 25, 10, 10);
	            this.emitter.gravity = 240;

	            //this.emitter.maxParticleSpeed.setTo(-50 * this.scale.x, 10 * this.scale.x);
	            this.emitter.setYSpeed(-20, -50);
	            this.emitter.setXSpeed(-30 * this.scale.x, -60 * this.scale.x);
	            this.emitter.bounce.setTo(1, 0);
	            this.emitter.mask = this.particleArea;
	            this.emitter.minParticleScale = 1.1;
	            this.emitter.maxParticleScale = 0.9;
	            this.emitter.alpha = 1;
	            //this.emitter.forEach(function(particle) {  particle.tint = 0xffffff;});
	            this.emitter.start(true, 2600, null, 10);
	        }
	    }, {
	        key: 'destroyEmitter',
	        value: function destroyEmitter() {
	            //this.emitter.destroy();
	        }
	    }, {
	        key: 'setState',
	        value: function setState(state) {
	            this.disableHitbox();
	            if (state === this.state) return;
	            this.state = state;
	            if (state === assetKeys.RUN) {
	                this.playRun();
	            } else if (state === assetKeys.IDLE) {
	                this.playIdle();
	            } else if (state === assetKeys.ATTACK) {
	                var anim = this.playAttack();
	                anim.onLoop.add(this.attack, this);
	            }
	        }
	    }, {
	        key: 'attack',
	        value: function attack() {
	            this.enableHitbox();
	        }
	    }, {
	        key: 'setupAnimations',
	        value: function setupAnimations() {
	            this.addRunAnimation();
	            this.addIdleAnimation();
	            this.addAttackAnimation();
	            this.addDeathAnimation();
	        }
	    }, {
	        key: 'addIdleAnimation',
	        value: function addIdleAnimation() {
	            this.loadTexture(assetKeys.IDLE);
	            var frames = (0, _utils.getRangeWithRandomStart)(4);
	            var fps = 12;
	            var shouldLoop = true;
	            this.animations.add(assetKeys.IDLE, frames, fps, shouldLoop);
	        }
	    }, {
	        key: 'addRunAnimation',
	        value: function addRunAnimation() {
	            this.loadTexture(assetKeys.RUN);
	            var frames = (0, _utils.getRangeWithRandomStart)(6);
	            var fps = 16;
	            var shouldLoop = true;
	            this.animations.add(assetKeys.RUN, frames, fps, shouldLoop);
	        }
	    }, {
	        key: 'addAttackAnimation',
	        value: function addAttackAnimation() {
	            this.loadTexture(assetKeys.ATTACK);
	            var frames = (0, _utils.getRangeArray)(11);
	            var fps = 16;
	            var shouldLoop = true;
	            this.animations.add(assetKeys.ATTACK, frames, fps, shouldLoop);
	        }
	    }, {
	        key: 'addDeathAnimation',
	        value: function addDeathAnimation() {
	            this.loadTexture(assetKeys.DEATH);
	            var frames = (0, _utils.getRangeArray)(8);
	            var fps = 12;
	            var shouldLoop = false;
	            this.animations.add(assetKeys.DEATH, frames, fps, shouldLoop);
	        }
	    }, {
	        key: 'playIdle',
	        value: function playIdle() {
	            this.playAnimation(assetKeys.IDLE);
	        }
	    }, {
	        key: 'playRun',
	        value: function playRun() {
	            this.playAnimation(assetKeys.RUN);
	        }
	    }, {
	        key: 'playAttack',
	        value: function playAttack() {
	            if (!attackSound) {
	                attackSound = game.add.audio('enemy-sword');
	            }
	            attackSound.volume = 0.5;
	            attackSound.play();

	            return this.playAnimation(assetKeys.ATTACK);
	        }
	    }, {
	        key: 'playDeath',
	        value: function playDeath() {
	            this.playAnimation(assetKeys.DEATH);
	        }
	    }, {
	        key: 'playAnimation',
	        value: function playAnimation(name) {
	            this.loadTexture(name);
	            this.animations.stop(null, true);
	            return this.animations.play(name);
	        }
	    }, {
	        key: 'gotHit',
	        value: function gotHit(arrow) {
	            var damageAmount = arrow.damageAmount;
	            var angle = arrow.rotation;

	            // "catch" the arrow
	            if (Math.random() < 0.2) {
	                this.arrows.push(arrow);

	                var r = -8;
	                var a = arrow.rotation;
	                var randomX = 4 * (Math.random() - 0.5);
	                var randomY = 4 * (Math.random() - 0.5);
	                arrow.x = this.x + randomX + r * Math.cos(a);
	                arrow.y = this.y + randomY + r * Math.sin(a) + 9;
	            } else {
	                arrow.kill();
	            }

	            // take damage
	            this.damage(damageAmount);

	            this.particleBurst(this);

	            // push back
	            var distance = damageAmount === 1 ? 20 : 30;
	            var duration = 32;
	            var dx = distance * Math.cos(angle);
	            var dy = distance * Math.sin(angle);
	            game.add.tween(this.body || this).to({
	                x: (dx > 0 ? '+' : '-') + Math.abs(dx),
	                y: (dy > 0 ? '+' : '-') + Math.abs(dy)
	            }, duration, Phaser.Easing.Bounce.Out, true);

	            // tint
	            if (this.health <= 0) {
	                this.tint = damageAmount === 1 ? 0xbbbbbb : 0x555555;
	            } else {
	                var percentageRed = 60 * (1 - this.health / this.maxHealth);
	                var channel = (100 - percentageRed) / 100 * 255 | 0;
	                this.tint = (0xff << 16) + (channel << 8) + channel;
	            }

	            // make noise
	            (0, _utils.choice)(hitSounds).play();

	            // alert any nearby enemies too
	            var alertThreshold = 75;
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = game.enemies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var enemy = _step.value;

	                    if (this.position.distance(enemy.position) <= alertThreshold) {
	                        enemy.wasAttacked = true;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        }
	    }, {
	        key: 'kill',
	        value: function kill() {
	            this.alive = false;
	            this.body.destroy();
	            this.playDeath();
	            (0, _utils.choice)(deathSounds).play();
	            this.hitbox.destroy();
	            this.arrows.forEach(function (arrow) {
	                return arrow.kill();
	            });
	        }
	    }, {
	        key: 'facesLeft',
	        value: function facesLeft() {
	            return this.scale.x === 1;
	        }
	    }, {
	        key: 'facesRight',
	        value: function facesRight() {
	            return !this.facesLeft();
	        }
	    }, {
	        key: 'enableHitbox',
	        value: function enableHitbox() {
	            var pos = this.getHitboxPosition();
	            this.hitbox.reset(pos.x, pos.y);
	        }
	    }, {
	        key: 'getHitboxPosition',
	        value: function getHitboxPosition() {
	            var pos = new Phaser.Point(this.body.x, this.body.y + 20);
	            var delta = 20;
	            if (this.facesLeft()) {
	                pos.x -= delta;
	            } else {
	                pos.x += delta;
	            }
	            return pos;
	        }
	    }, {
	        key: 'disableHitbox',
	        value: function disableHitbox() {
	            this.hitbox.kill();
	        }
	    }, {
	        key: 'hitPlayer',
	        value: function hitPlayer() {
	            this.game.player.takeDamage(30);
	        }
	    }]);

	    return Enemy;
	}(Phaser.Sprite);

	exports.default = Enemy;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getMusicFiles = getMusicFiles;
	exports.getSoundFiles = getSoundFiles;
	exports.getAudioFiles = getAudioFiles;
	exports.choice = choice;
	exports.getRangeArray = getRangeArray;
	exports.getRangeWithRandomStart = getRangeWithRandomStart;
	function getMusicFiles(name) {
	    return getAudioFiles('assets/music/' + name);
	}

	function getSoundFiles(name) {
	    return getAudioFiles('assets/sounds/' + name);
	}

	function getAudioFiles(name) {
	    return ['mp3', 'ogg'].map(function (ext) {
	        return name + '.' + ext;
	    });
	}

	function choice(array) {
	    if (!array.length) {
	        return null;
	    }
	    var idx = Math.random() * array.length | 0;
	    return array[idx];
	}

	function getRangeArray(n) {
	    var array = [];
	    for (var i = 0; i < n; i++) {
	        array.push(i);
	    }
	    return array;
	}

	function getRangeWithRandomStart(n) {
	    var array = getRangeArray(n);
	    var idx = Math.random() * n | 0;
	    var firstSlice = array.splice(idx);
	    return firstSlice.concat(array);
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _commands = __webpack_require__(4);

	var _tweens = __webpack_require__(5);

	var _arrow = __webpack_require__(6);

	var _arrow2 = _interopRequireDefault(_arrow);

	var _utils = __webpack_require__(2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var assetKeys = {
	    physicsSprite: 'physicsSprite',
	    upperBody: 'upperBody',
	    legsRunning: 'legsRunning',
	    legsIdle: 'legsIdle',
	    shadow: 'shadow'
	};

	var hitSounds = void 0;
	var deathSounds = void 0;

	var Player = function (_Phaser$Group) {
	    _inherits(Player, _Phaser$Group);

	    _createClass(Player, null, [{
	        key: 'preload',
	        value: function preload() {
	            game.load.image(assetKeys.physicsSprite, 'assets/player-hit-area.png', 50, 50);
	            game.load.spritesheet(assetKeys.upperBody, 'assets/hero-bowattack.png', 50, 50);
	            game.load.spritesheet(assetKeys.legsRunning, 'assets/running.png', 50, 50);
	            game.load.spritesheet(assetKeys.legsIdle, 'assets/idle.png', 50, 50);
	            game.load.spritesheet(assetKeys.shadow, 'assets/shadow.png', 50, 50);
	            game.load.image('blood', 'assets/pixel.png');

	            game.load.audio('hero_hit1', (0, _utils.getSoundFiles)('hero_hit1'));
	            game.load.audio('hero_hit2', (0, _utils.getSoundFiles)('hero_hit2'));
	            game.load.audio('hero_death1', (0, _utils.getSoundFiles)('death'));
	        }
	    }]);

	    function Player(game, x, y) {
	        _classCallCheck(this, Player);

	        var _this = _possibleConstructorReturn(this, (Player.__proto__ || Object.getPrototypeOf(Player)).call(this, game));

	        _this.bowLoadInProgress = false;
	        _this.bowReleaseInProgress = false;
	        _this.bowLoadTime = 0;

	        _this.pendingCommands = [];

	        // create physics sprite
	        _this.physicsSprite = _this.add(new Phaser.Sprite(game, x, y, assetKeys.physicsSprite));
	        game.physics.p2.enable(_this.physicsSprite);
	        _this.physicsSprite.body.fixedRotation = true;
	        _this.physicsSprite.body.clearShapes();
	        _this.physicsSprite.body.addCircle(10, 0, 0);
	        _this.physicsSprite.body.setCollisionGroup(game.collider.PLAYER_COLLISION_GROUP);
	        _this.physicsSprite.body.collides([game.collider.STATIC_COLLISION_GROUP, game.collider.ENEMY_COLLISION_GROUP, game.collider.ENEMY_SWORD_ATTACK_COLLISION_GROUP]);

	        _this.cameraTarget = _this.add(new Phaser.Sprite(game, x, y, assetKeys.physicsSprite));

	        _this.legsRunning = _this.add(new Phaser.Sprite(game, x, y, assetKeys.legsRunning));
	        _this.legsRunning.anchor.x = 0.5;

	        _this.legsIdle = _this.add(new Phaser.Sprite(game, x, y, assetKeys.legsIdle));
	        _this.legsIdle.anchor.x = 0.5;

	        _this.upperBody = _this.add(new Phaser.Sprite(game, x, y, assetKeys.upperBody));
	        _this.upperBody.anchor.x = 0.5;
	        _this.upperBody.anchor.y = 0.8;

	        _this.shadow = _this.add(new Phaser.Sprite(game, x, y, assetKeys.shadow));
	        _this.shadow.anchor.x = 0.5;
	        _this.shadow.anchor.y = 0.5;

	        _this.setupAnimations();

	        _this.alive = true;
	        _this.maxHealth = 100;
	        _this.health = 100;

	        _this.emitter = game.add.emitter(0, 0, 100);
	        _this.emitter.makeParticles('blood');
	        _this.emitter.gravity = 200;

	        if (!hitSounds) {
	            hitSounds = [game.add.audio('hero_hit1'), game.add.audio('hero_hit2')];
	        }
	        if (!deathSounds) {
	            deathSounds = [game.add.audio('hero_death1')];
	        }
	        return _this;
	    }

	    _createClass(Player, [{
	        key: 'setupAnimations',
	        value: function setupAnimations() {
	            var fps = 10;
	            var loop = true;

	            this.upperBody.animations.add('load-bow', [0, 1, 2, 3, 4], 30, !loop);
	            this.upperBody.animations.add('release-bow', [5, 6, 7, 8, 1, 0], 20, !loop);

	            this.runAnimation = this.legsRunning.animations.add('run', [0, 1, 2, 3, 4, 5, 6, 7], fps, loop);
	            this.runAnimation.originalFrameRate = fps;

	            this.shadow.bodyTween = game.add.tween(this.shadow.scale).to({ x: 0.6, y: 1 }, 400, Phaser.Easing.Bounce.InOut, true, 0, false, true).loop();

	            this.legsIdle.animations.add('idle', [0, 1, 1, 0], fps, loop);
	            this.legsIdle.bodyTween = (0, _tweens.setFrameValues)(game.add.tween(this.legsIdle), 'bodyDy', [-1, 0, 1, 0]).loop().start();
	        }
	    }, {
	        key: 'sendCommands',
	        value: function sendCommands(commands) {
	            var _this2 = this;

	            commands.forEach(function (command) {
	                return _this2.sendCommand(command);
	            });
	        }
	    }, {
	        key: 'sendCommand',
	        value: function sendCommand(command) {
	            if (!this.alive) return;
	            this.pendingCommands.push(command);
	        }
	    }, {
	        key: 'update',
	        value: function update() {
	            // get movement direction and mouse position
	            var context = {
	                mousePosition: new Phaser.Point(),
	                direction: _commands.Directions.None
	            };

	            while (this.pendingCommands.length) {
	                var command = this.pendingCommands.shift();
	                this.handleCommand(command, context);
	            }

	            var direction = context.direction;

	            // get relative mouse position
	            var cursorX = game.camera.x + context.mousePosition.x;
	            var cursorY = game.camera.y + context.mousePosition.y;
	            var isMouseToTheRight = cursorX - this.physicsSprite.x > 0;
	            var isMouseToTheTop = cursorY - this.physicsSprite.y < 0;

	            // look left/right
	            this.upperBody.scale.x = isMouseToTheRight ? -1 : 1;

	            // move player
	            var _ = _commands.Directions;
	            var vx = 0;
	            var vy = 0;
	            if (direction) {
	                var _$Up$_$UpRight$_$Righ;

	                // slow down when holding the mouse button
	                var minDuration = 0.1;
	                var maxDuration = 0.5;
	                var duration = game.input.activePointer.duration / 1000;
	                var progress = Math.max(0, Math.min(1, (duration - minDuration) / (maxDuration - minDuration)));
	                var mappedProgress = Math.sin(Math.PI / 2 * progress);

	                var fullSpeed = 120;
	                var speed = fullSpeed - 60 * mappedProgress;
	                var angle = Math.PI / 4 * (_$Up$_$UpRight$_$Righ = {}, _defineProperty(_$Up$_$UpRight$_$Righ, _.Up, 6), _defineProperty(_$Up$_$UpRight$_$Righ, _.UpRight, 7), _defineProperty(_$Up$_$UpRight$_$Righ, _.Right, 0), _defineProperty(_$Up$_$UpRight$_$Righ, _.DownRight, 1), _defineProperty(_$Up$_$UpRight$_$Righ, _.Down, 2), _defineProperty(_$Up$_$UpRight$_$Righ, _.DownLeft, 3), _defineProperty(_$Up$_$UpRight$_$Righ, _.Left, 4), _defineProperty(_$Up$_$UpRight$_$Righ, _.UpLeft, 5), _$Up$_$UpRight$_$Righ)[direction];

	                vx = speed * Math.cos(angle);
	                vy = speed * Math.sin(angle);

	                var fps = this.runAnimation.originalFrameRate * speed / fullSpeed;
	                this.runAnimation.delay = 1000 / fps;
	            }

	            var inertia = 0.3;
	            var body = this.physicsSprite.body;
	            body.velocity.x = 0 | inertia * body.velocity.x + (1 - inertia) * vx;
	            body.velocity.y = 0 | inertia * body.velocity.y + (1 - inertia) * vy;

	            // face legs left/right
	            this.legsIdle.scale.x = this.legsRunning.scale.x = function () {
	                if (direction & _.Left) return 1;
	                if (direction & _.Right) return -1;
	                if (isMouseToTheRight) return -1;
	                return 1;
	            }();

	            // animate legs
	            if (direction) {
	                this.legsRunning.visible = true;
	                this.legsIdle.alpha = 0;
	                this.legsRunning.animations.play('run');
	                // TODO add running direction change and reset run animation + related tweens on this event
	            } else {
	                this.legsRunning.visible = false;

	                // stop running animation when player is not running (duh)
	                this.legsRunning.animations.stop(null, true);

	                // reset tween - TODO maybe just set the right frame instead of all this - but no clue how to do this
	                this.legsRunning.bodyTween = (0, _tweens.setFrameValues)(game.add.tween(this.legsRunning), 'bodyDy', [0, -1, 0, 2, 0, -2, -1, 1]).loop().start();

	                // override shadow tween when not running
	                this.shadow.bodyTween = game.add.tween(this.shadow.scale).to({ x: 1, y: 1 }, 50, Phaser.Easing.Linear.In, true);

	                this.legsIdle.alpha = 1;
	                this.legsIdle.animations.play('idle');
	            }

	            this.updateLayerPositions();
	            this.updateUpperBodyRotation(cursorX, cursorY);
	            this.updateCameraTarget();
	        }
	    }, {
	        key: 'updateUpperBodyRotation',
	        value: function updateUpperBodyRotation(mouseX, mouseY) {
	            var dx = mouseX - this.upperBody.x;
	            var dy = mouseY - this.upperBody.y;

	            var maxUpDegrees = 45;
	            var maxDownDegrees = 45;

	            var minAngle = -maxUpDegrees / 180 * Math.PI;
	            var maxAngle = maxDownDegrees / 180 * Math.PI;
	            var angle = Math.atan2(dy, Math.abs(dx));

	            this.upperBody.rotation = Math.max(minAngle, Math.min(maxAngle, angle)) * Math.sign(dx);
	        }
	    }, {
	        key: 'updateLayerPositions',
	        value: function updateLayerPositions() {
	            var reference = this.physicsSprite.position;
	            reference.y -= 35;

	            this.upperBody.x = reference.x;
	            this.upperBody.y = reference.y + this.upperBody.height * this.upperBody.anchor.y;

	            this.shadow.x = reference.x;
	            this.shadow.y = reference.y + 47;

	            // animate body using legs' tweens
	            var legs = this.legsIdle.alpha == 1 ? this.legsIdle : this.legsRunning;
	            this.upperBody.y += legs.bodyDy;

	            this.legsIdle.x = this.legsRunning.x = reference.x;
	            this.legsIdle.y = this.legsRunning.y = reference.y;
	        }
	    }, {
	        key: 'updateCameraTarget',
	        value: function updateCameraTarget() {
	            var target = this.cameraTarget;
	            var reference = this.physicsSprite.position;

	            // shake when mouse button is pressed for a long time
	            var minDuration = 0.1;
	            var maxDuration = 0.9;
	            var duration = game.input.activePointer.duration / 1000;
	            var progress = Math.max(0, Math.min(1, (duration - minDuration) / (maxDuration - minDuration)));

	            var t = game.time.time / 1000;
	            var dx = 12 * progress * Math.sin(80 * t);
	            var dy = 2 * progress * Math.sin(50 * t);

	            target.x = reference.x + dx;
	            target.y = reference.y + dy;
	        }
	    }, {
	        key: 'handleCommand',
	        value: function handleCommand(command, context) {
	            var handler = void 0;
	            if (command instanceof _commands.PointAtPosition) handler = this.handlePointAtDirection;else if (command instanceof _commands.MoveInDirection) handler = this.handleMoveInDirection;else if (command instanceof _commands.PrepareForAttack) handler = this.handlePrepareForAttack.bind(this);else if (command instanceof _commands.AttackAtPosition) handler = this.handleAttackAtPosition.bind(this);else throw new Error("Cannot find proper command handler");
	            handler(command, context);
	        }
	    }, {
	        key: 'handlePointAtDirection',
	        value: function handlePointAtDirection(command, context) {
	            context.mousePosition = command.position;
	        }
	    }, {
	        key: 'handleMoveInDirection',
	        value: function handleMoveInDirection(command, context) {
	            context.direction = command.direction;
	        }
	    }, {
	        key: 'handlePrepareForAttack',
	        value: function handlePrepareForAttack(command, context) {
	            if (!this.alive || this.bowLoadInProgress) return;
	            this.bowLoadInProgress = true;

	            this.bowLoadTime = game.time.time;
	            this.upperBody.animations.play('load-bow');
	        }
	    }, {
	        key: 'handleAttackAtPosition',
	        value: function handleAttackAtPosition(command, context) {
	            var _this3 = this;

	            if (!this.alive || this.bowReleaseInProgress) return;
	            this.bowReleaseInProgress = true;

	            var duration = game.time.time - this.bowLoadTime;
	            var delay = Math.max(0, 200 - duration);
	            var cooldown = 300;

	            window.setTimeout(function () {
	                _this3.upperBody.animations.play('release-bow');
	                if (duration > 500) {
	                    _this3.fireChargedArrow(command.position);
	                } else {
	                    _this3.fireArrowAt(command.position);
	                }
	            }, delay);

	            window.setTimeout(function () {
	                _this3.bowLoadInProgress = false;
	                _this3.bowReleaseInProgress = false;
	            }, delay + cooldown);
	        }
	    }, {
	        key: '_fireArrowAt',
	        value: function _fireArrowAt(position, arrow) {
	            // Imagine a circle around the player.
	            // We move the arrow to a point on the edge of that circle and then release it.

	            var target = new Phaser.Point(game.camera.x + position.x, game.camera.y + position.y);

	            var center = new Phaser.Point(this.physicsSprite.x, this.physicsSprite.y - 4);

	            var radius = 16;
	            var angle = center.angle(target);

	            arrow.reset(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));
	            arrow.fireAt(target);
	        }
	    }, {
	        key: 'fireArrowAt',
	        value: function fireArrowAt(position) {
	            var arrow = game.add.existing(new _arrow2.default(game, 0, 0));
	            if (arrow) {
	                this._fireArrowAt(position, arrow);
	            }
	        }
	    }, {
	        key: 'fireChargedArrow',
	        value: function fireChargedArrow(position) {
	            var arrow = game.add.existing(new _arrow2.default(game, 0, 0, 5, true));
	            if (arrow) {
	                this._fireArrowAt(position, arrow);
	            }
	        }
	    }, {
	        key: 'particleBurst',
	        value: function particleBurst(pointer) {

	            // draw area where particles are displayed
	            var poly = new Phaser.Polygon(75, -50, 75, 15, -75, 15, -75, -50);
	            this.particleArea = game.add.graphics(pointer.x, pointer.y);
	            this.particleArea.beginFill(0x000000);
	            this.particleArea.drawPolygon(poly.points);
	            this.particleArea.endFill();

	            if (this.emitter.alive || this.emitter) {
	                //destroy prevously rendered emitter if exist
	                this.emitter.destroy();
	                this.emitter = game.add.emitter(0, 20, 38);
	                this.emitter.makeParticles('blood');
	            }

	            this.emitter.x = pointer.x;
	            this.emitter.y = pointer.y;
	            this.emitter.area = new Phaser.Rectangle(pointer.x - 25, pointer.y - 25, 10, 10);
	            this.emitter.gravity = 240;

	            this.emitter.setYSpeed(-20, -50);
	            this.emitter.bounce.setTo(1, 0);
	            this.emitter.mask = this.particleArea;
	            this.emitter.minParticleScale = 1.1;
	            this.emitter.maxParticleScale = 0.9;
	            this.emitter.alpha = 1;
	            this.emitter.forEach(function (particle) {
	                particle.tint = 0xff0000;
	            });
	            this.emitter.start(true, 2600, null, 10);
	        }
	    }, {
	        key: 'takeDamage',
	        value: function takeDamage(value) {

	            //BLOOD!
	            this.particleBurst(this.upperBody);

	            if (!this.alive) return;
	            this.health -= value;
	            var perc = this.health / this.maxHealth;
	            this.setBodyRed(perc);

	            if (this.health <= 0) {
	                this.alive = false;
	                (0, _utils.choice)(deathSounds).play();
	                game.camera.flash(0xff0000, 5000);
	                game.showGameOver();
	            } else {
	                (0, _utils.choice)(hitSounds).play();
	            }
	        }
	    }, {
	        key: 'setBodyRed',
	        value: function setBodyRed(value) {
	            // value should be a float [0..1]
	            var channel = value * 255;
	            var tint = (0xff << 16) + (channel << 8) + channel;
	            this.upperBody.tint = tint;
	            this.legsIdle.tint = tint;
	            this.legsRunning.tint = tint;
	        }
	    }]);

	    return Player;
	}(Phaser.Group);

	exports.default = Player;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PointAtPosition = exports.PointAtPosition = function PointAtPosition(position) {
	    _classCallCheck(this, PointAtPosition);

	    this.position = position;
	};

	var MoveInDirection = exports.MoveInDirection = function MoveInDirection(direction) {
	    _classCallCheck(this, MoveInDirection);

	    this.direction = direction;
	};

	var AttackAtPosition = exports.AttackAtPosition = function AttackAtPosition(position, duration) {
	    _classCallCheck(this, AttackAtPosition);

	    this.position = position;
	    this.duration = duration;
	};

	var PrepareForAttack = exports.PrepareForAttack = function PrepareForAttack(position) {
	    _classCallCheck(this, PrepareForAttack);

	    this.position = position;
	};

	var up = 1 << 0;
	var down = 1 << 1;
	var left = 1 << 2;
	var right = 1 << 3;

	var Directions = exports.Directions = {
	    None: 0,

	    Up: up,
	    UpRight: up + right,
	    Right: right,
	    DownRight: down + right,
	    Down: down,
	    DownLeft: down + left,
	    Left: left,
	    UpLeft: up + left
	};

	var InputHandler = exports.InputHandler = function () {
	    function InputHandler() {
	        _classCallCheck(this, InputHandler);
	    }

	    _createClass(InputHandler, null, [{
	        key: "getMousePointerCommand",
	        value: function getMousePointerCommand() {
	            return new PointAtPosition(game.input.mousePointer.position);
	        }
	    }, {
	        key: "getMouseDownCommand",
	        value: function getMouseDownCommand() {
	            var pointer = game.input.activePointer;
	            return new PrepareForAttack(pointer.position);
	        }
	    }, {
	        key: "getMouseUpCommand",
	        value: function getMouseUpCommand() {
	            var pointer = game.input.activePointer;

	            // ignore some randomly generated events (like mouse enters game screen)
	            if (pointer.duration > 0) {
	                return new AttackAtPosition(pointer.position, pointer.duration);
	            }
	        }
	    }, {
	        key: "getKeyboardCommands",
	        value: function getKeyboardCommands() {
	            // "bind" keys, get direction
	            var _ = Phaser.KeyCode;
	            var keyboard = game.input.keyboard;
	            var isUp = keyboard.isDown(_.W) || keyboard.isDown(_.UP);
	            var isDown = keyboard.isDown(_.S) || keyboard.isDown(_.DOWN);
	            var isLeft = keyboard.isDown(_.A) || keyboard.isDown(_.LEFT);
	            var isRight = keyboard.isDown(_.D) || keyboard.isDown(_.RIGHT);

	            return [new MoveInDirection((isUp ? up : isDown ? down : 0) + (isRight ? right : isLeft ? left : 0))];
	        }
	    }]);

	    return InputHandler;
	}();

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.setFrameValues = setFrameValues;

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function setFrameValues(tween, key, values) {
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var value = _step.value;

	            tween = tween.to(_defineProperty({}, key, value), 1).to(_defineProperty({}, key, value), 80); /* 0.08s per frame */
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }

	    return tween;
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ASSET_KEY = 'arrow';
	var EXPLOSION = 'explosion';

	var fireArrowSound = void 0;

	var Arrow = function (_Phaser$Sprite) {
	    _inherits(Arrow, _Phaser$Sprite);

	    _createClass(Arrow, null, [{
	        key: 'preload',
	        value: function preload(game) {
	            game.load.image(ASSET_KEY, 'assets/simple-arrow.png');
	            game.load.image('fire-pixel', 'assets/fire-pixel.png');
	            game.load.spritesheet('explosion', 'assets/explosion-2.png', 64, 64);
	            game.load.audio('fire-arrow', ['assets/sounds/bow_hit.mp3', 'assets/sounds/bow_hit.ogg']);
	        }
	    }]);

	    function Arrow(game, x, y, damageAmount, isCharged) {
	        _classCallCheck(this, Arrow);

	        var _this = _possibleConstructorReturn(this, (Arrow.__proto__ || Object.getPrototypeOf(Arrow)).call(this, game, x, y, ASSET_KEY));

	        _this.damageAmount = damageAmount || 1;
	        _this.isCharged = !!isCharged;

	        game.physics.p2.enable(_this);
	        _this.body.setCollisionGroup(game.collider.ARROW_COLLISION_GROUP);
	        _this.body.fixedRotation = true;
	        _this.body.collides(game.collider.ENEMY_COLLISION_GROUP, _this.hitTarget, _this);
	        _this.body.collideWorldBounds = false;
	        _this.firedAtPosition = null;

	        _this.checkWorldBounds = true;
	        _this.outOfBoundsKill = true;

	        if (!fireArrowSound) {
	            fireArrowSound = game.add.audio('fire-arrow');
	        }
	        _this.setupEmitter();

	        _this.setupAnimations();
	        return _this;
	    }

	    _createClass(Arrow, [{
	        key: 'update',
	        value: function update() {
	            this.emitter.x = this.x;
	            this.emitter.y = this.y;
	        }
	    }, {
	        key: 'fireAt',
	        value: function fireAt(position) {
	            this.rotation = this.position.angle(position);

	            var speed = 700;
	            var vector = Phaser.Point.subtract(position, this.position).normalize();

	            this.body.velocity.x = speed * vector.x;
	            this.body.velocity.y = speed * vector.y;
	            fireArrowSound.play();

	            if (this.isCharged) {
	                this.emitter.visible = true;
	            }
	        }
	    }, {
	        key: 'hitTarget',
	        value: function hitTarget(arrowBody, otherBody) {
	            if (!this.alive || !this.body) {
	                return;
	            }
	            if (this.isCharged) {
	                this.playExplosion();
	            }
	            this.emitter.visible = false;

	            // damage the enemy
	            otherBody.sprite.gotHit(this);
	            this.body.destroy();
	        }
	    }, {
	        key: 'setupEmitter',
	        value: function setupEmitter() {
	            this.emitter = this.game.add.emitter(this.x, this.y, 20);
	            this.emitter.gravity = 800;
	            this.emitter.makeParticles(['fire-pixel']);
	            this.emitter.setAlpha(0.6, 1, 250);
	            this.emitter.setScale(0.8, 0, 0.8, 0, 2000);

	            this.emitter.start(false, 250, 5);
	            this.emitter.visible = false;
	        }
	    }, {
	        key: 'setupAnimations',
	        value: function setupAnimations() {
	            this.explosionSprite = this.game.add.sprite(0, 0, EXPLOSION);
	            this.explosionSprite.anchor.setTo(0.5, 0.5);
	            var frames = (0, _utils.getRangeArray)(8);
	            var fps = 20;
	            var shouldLoop = false;
	            this.explosionSprite.animations.add('explosion', frames, fps, shouldLoop);
	            this.explosionSprite.visible = false;
	        }
	    }, {
	        key: 'playExplosion',
	        value: function playExplosion() {
	            this.explosionSprite.visible = true;
	            this.explosionSprite.x = this.x;
	            this.explosionSprite.y = this.y;
	            this.explosionSprite.animations.stop();
	            var anim = this.explosionSprite.animations.play('explosion');
	            anim.onComplete.add(function () {
	                this.explosionSprite.visible = false;
	            }, this);
	        }
	    }]);

	    return Arrow;
	}(Phaser.Sprite);

	exports.default = Arrow;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var assetKey = 'mousePointer';
	var assetKeyActive = 'mousePointerActive';

	var MousePointer = function (_Phaser$Sprite) {
	    _inherits(MousePointer, _Phaser$Sprite);

	    _createClass(MousePointer, null, [{
	        key: 'preload',
	        value: function preload() {
	            game.load.image(assetKey, 'assets/cursor1.png');
	            game.load.image(assetKeyActive, 'assets/cursor2.png');
	        }
	    }]);

	    function MousePointer(game, x, y) {
	        _classCallCheck(this, MousePointer);

	        var _this = _possibleConstructorReturn(this, (MousePointer.__proto__ || Object.getPrototypeOf(MousePointer)).call(this, game, x, y, assetKey));

	        _this.anchor = new Phaser.Point(0.5, 0.3);
	        game.input.onDown.add(_this.setActiveState, _this);
	        game.input.onUp.add(_this.setNormalState, _this);
	        return _this;
	    }

	    _createClass(MousePointer, [{
	        key: 'setActiveState',
	        value: function setActiveState() {
	            this.loadTexture(assetKeyActive);
	        }
	    }, {
	        key: 'setNormalState',
	        value: function setNormalState() {
	            this.loadTexture(assetKey);
	        }
	    }, {
	        key: 'update',
	        value: function update() {
	            this.x = game.camera.x + game.input.mousePointer.x;
	            this.y = game.camera.y + game.input.mousePointer.y;
	        }
	    }]);

	    return MousePointer;
	}(Phaser.Sprite);

	exports.default = MousePointer;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Collider = function Collider(game) {
	    _classCallCheck(this, Collider);

	    this.game = game;

	    this.STATIC_COLLISION_GROUP = game.physics.p2.createCollisionGroup();
	    this.PLAYER_COLLISION_GROUP = game.physics.p2.createCollisionGroup();
	    this.ENEMY_COLLISION_GROUP = game.physics.p2.createCollisionGroup();
	    this.ENEMY_SWORD_ATTACK_COLLISION_GROUP = game.physics.p2.createCollisionGroup();
	    this.ARROW_COLLISION_GROUP = game.physics.p2.createCollisionGroup();
	};

	exports.default = Collider;

/***/ }
/******/ ]);