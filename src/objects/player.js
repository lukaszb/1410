import {PointAtPosition, PrepareForAttack, MoveInDirection, Directions, AttackAtPosition} from './commands';
import {setFrameValues} from './tweens';
import Arrow from './arrow';
import {getSoundFiles, getRangeArray, choice} from '../utils';


const assetKeys = {
    physicsSprite: 'physicsSprite',
    upperBody: 'upperBody',
    legsRunning: 'legsRunning',
    legsIdle: 'legsIdle',
    shadow: 'shadow'
};

let hitSounds;
let deathSounds;

export default class Player extends Phaser.Group {
    static preload() {
        game.load.image(assetKeys.physicsSprite, 'assets/player-hit-area.png', 50, 50);
        game.load.spritesheet(assetKeys.upperBody, 'assets/hero-bowattack.png', 50, 50);
        game.load.spritesheet(assetKeys.legsRunning, 'assets/running.png', 50, 50);
        game.load.spritesheet(assetKeys.legsIdle, 'assets/idle.png', 50, 50);
        game.load.spritesheet(assetKeys.shadow, 'assets/shadow.png', 50, 50);
        game.load.image('blood', 'assets/pixel.png');

        game.load.audio('hero_hit1', getSoundFiles('hero_hit1'));
        game.load.audio('hero_hit2', getSoundFiles('hero_hit2'));
        game.load.audio('hero_death1', getSoundFiles('death'));

    }

    constructor(game, x, y) {
        super(game);

        this.bowLoadInProgress = false;
        this.bowReleaseInProgress = false;
        this.bowLoadTime = 0;

        this.pendingCommands = [];

        // create physics sprite
        this.physicsSprite = this.add(new Phaser.Sprite(game, x, y, assetKeys.physicsSprite));
        game.physics.p2.enable(this.physicsSprite);
        this.physicsSprite.body.fixedRotation = true;
        this.physicsSprite.body.clearShapes();
        this.physicsSprite.body.addCircle(10, 0, 0);
        this.physicsSprite.body.setCollisionGroup(game.collider.PLAYER_COLLISION_GROUP);
        this.physicsSprite.body.collides([
            game.collider.STATIC_COLLISION_GROUP,
            game.collider.ENEMY_COLLISION_GROUP,
            game.collider.ENEMY_SWORD_ATTACK_COLLISION_GROUP,
        ]);

        this.cameraTarget = this.add(new Phaser.Sprite(game, x, y, assetKeys.physicsSprite));

        this.legsRunning = this.add(new Phaser.Sprite(game, x, y, assetKeys.legsRunning));
        this.legsRunning.anchor.x = 0.5;

        this.legsIdle = this.add(new Phaser.Sprite(game, x, y, assetKeys.legsIdle));
        this.legsIdle.anchor.x = 0.5;

        this.upperBody = this.add(new Phaser.Sprite(game, x, y, assetKeys.upperBody));
        this.upperBody.anchor.x = 0.5;
        this.upperBody.anchor.y = 0.8;

        this.shadow = this.add(new Phaser.Sprite(game, x, y, assetKeys.shadow));
        this.shadow.anchor.x = 0.5;
        this.shadow.anchor.y = 0.5;

        this.setupAnimations();

        this.alive = true;
        this.maxHealth = 100;
        this.health = 100;

        this.emitter = game.add.emitter(0, 0, 100);
        this.emitter.makeParticles('blood');
        this.emitter.gravity = 200;

        if (!hitSounds) {
            hitSounds = [
                game.add.audio('hero_hit1'),
                game.add.audio('hero_hit2'),
            ];
        }
        if (!deathSounds) {
            deathSounds = [
                game.add.audio('hero_death1'),
            ];
        }
    }

    setupAnimations() {
        const fps = 10;
        const loop = true;

        this.upperBody.animations.add('load-bow', [0, 1, 2, 3, 4], 30, !loop);
        this.upperBody.animations.add('release-bow', [5, 6, 7, 8, 1, 0], 20, !loop);

        this.runAnimation = this.legsRunning.animations.add('run', [0, 1, 2, 3, 4, 5, 6, 7], fps, loop);
        this.runAnimation.originalFrameRate = fps;

        this.shadow.bodyTween = game.add.tween(this.shadow.scale).to({x: 0.6, y: 1}, 400, Phaser.Easing.Bounce.InOut, true, 0, false, true).loop();

        this.legsIdle.animations.add('idle', [0, 1, 1, 0], fps, loop);
        this.legsIdle.bodyTween = setFrameValues(game.add.tween(this.legsIdle), 'bodyDy',
            [-1, 0, 1, 0]).loop().start();
    }

    sendCommands(commands) {
        commands.forEach((command) => this.sendCommand(command));
    }

    sendCommand(command) {
        if (!this.alive) return;
        this.pendingCommands.push(command);
    }

    update() {
        // get movement direction and mouse position
        let context = {
            mousePosition: new Phaser.Point(),
            direction: Directions.None,
        };

        while(this.pendingCommands.length) {
            let command = this.pendingCommands.shift();
            this.handleCommand(command, context);
        }

        const direction = context.direction;

        // get relative mouse position
        var cursorX = game.camera.x + context.mousePosition.x;
        var cursorY = game.camera.y + context.mousePosition.y;
        const isMouseToTheRight = cursorX - this.physicsSprite.x > 0;
        const isMouseToTheTop   = cursorY - this.physicsSprite.y < 0;

        // look left/right
        this.upperBody.scale.x = isMouseToTheRight ? -1 : 1;

        // move player
        const _ = Directions;
        let vx = 0;
        let vy = 0;
        if (direction) {
            // slow down when holding the mouse button
            const minDuration = 0.1;
            const maxDuration = 0.5;
            const duration = game.input.activePointer.duration / 1000;
            const progress = Math.max(0, Math.min(1, (duration - minDuration) / (maxDuration - minDuration)));
            const mappedProgress = Math.sin(Math.PI/2 * progress);

            const fullSpeed = 120;
            const speed = fullSpeed - 60 * mappedProgress;
            const angle = Math.PI / 4 * {
                [_.Up]: 6,
                [_.UpRight]: 7,
                [_.Right]: 0,
                [_.DownRight]: 1,
                [_.Down]: 2,
                [_.DownLeft]: 3,
                [_.Left]: 4,
                [_.UpLeft]: 5,
            }[direction];

            vx = speed * Math.cos(angle);
            vy = speed * Math.sin(angle);

            const fps = this.runAnimation.originalFrameRate * speed / fullSpeed;
            this.runAnimation.delay = 1000 / fps;
        }

        const inertia = 0.3;
        const body = this.physicsSprite.body;
        body.velocity.x = 0 | (inertia * body.velocity.x + (1 - inertia) * vx);
        body.velocity.y = 0 | (inertia * body.velocity.y + (1 - inertia) * vy);

        // face legs left/right
        this.legsIdle.scale.x =
        this.legsRunning.scale.x = (() => {
            if (direction & _.Left) return 1;
            if (direction & _.Right) return -1;
            if (isMouseToTheRight) return -1;
            return 1;
        })();

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
            this.legsRunning.bodyTween = setFrameValues(game.add.tween(this.legsRunning), 'bodyDy',
                [0, -1, 0, 2, 0, -2, -1, 1]).loop().start();

            // override shadow tween when not running
            this.shadow.bodyTween = game.add.tween(this.shadow.scale).to({x: 1, y: 1}, 50, Phaser.Easing.Linear.In, true);

            this.legsIdle.alpha = 1;
            this.legsIdle.animations.play('idle');
        }

        this.updateLayerPositions();
        this.updateUpperBodyRotation(cursorX, cursorY);
        this.updateCameraTarget();
    }

    updateUpperBodyRotation(mouseX, mouseY) {
        const dx = mouseX - this.upperBody.x;
        const dy = mouseY - this.upperBody.y;

        const maxUpDegrees = 45;
        const maxDownDegrees = 45;

        const minAngle = -maxUpDegrees / 180 * Math.PI;
        const maxAngle = maxDownDegrees / 180 * Math.PI;
        const angle = Math.atan2(dy, Math.abs(dx));

        this.upperBody.rotation = Math.max(minAngle, Math.min(maxAngle, angle)) * Math.sign(dx);
    }

    updateLayerPositions() {
        const reference = this.physicsSprite.position;
        reference.y -= 35;

        this.upperBody.x = reference.x;
        this.upperBody.y = reference.y + this.upperBody.height * this.upperBody.anchor.y;

        this.shadow.x = reference.x;
        this.shadow.y = reference.y + 47;

        // animate body using legs' tweens
        const legs = this.legsIdle.alpha == 1 ? this.legsIdle : this.legsRunning;
        this.upperBody.y += legs.bodyDy;

        this.legsIdle.x = this.legsRunning.x = reference.x;
        this.legsIdle.y = this.legsRunning.y = reference.y;
    }

    updateCameraTarget() {
        const target = this.cameraTarget;
        const reference = this.physicsSprite.position;

        // shake when mouse button is pressed for a long time
        const minDuration = 0.1;
        const maxDuration = 0.9;
        const duration = game.input.activePointer.duration / 1000;
        const progress = Math.max(0, Math.min(1, (duration - minDuration) / (maxDuration - minDuration)));

        const t = game.time.time / 1000;
        const dx = 12 * progress * Math.sin(80 * t);
        const dy =  2 * progress * Math.sin(50 * t);

        target.x = reference.x + dx;
        target.y = reference.y + dy;
    }

    handleCommand(command, context) {
        let handler;
        if (command instanceof PointAtPosition) handler = this.handlePointAtDirection;
        else if (command instanceof MoveInDirection) handler = this.handleMoveInDirection;
        else if (command instanceof PrepareForAttack) handler = this.handlePrepareForAttack.bind(this);
        else if (command instanceof AttackAtPosition) handler = this.handleAttackAtPosition.bind(this);
        else throw new Error("Cannot find proper command handler");
        handler(command, context);
    }

    handlePointAtDirection(command, context) {
        context.mousePosition = command.position;
    }

    handleMoveInDirection(command, context) {
        context.direction = command.direction;
    }

    handlePrepareForAttack(command, context) {
        if (!this.alive || this.bowLoadInProgress) return;
        this.bowLoadInProgress = true;

        this.bowLoadTime = game.time.time;
        this.upperBody.animations.play('load-bow');
    }

    handleAttackAtPosition(command, context) {
        if (!this.alive || this.bowReleaseInProgress) return;
        this.bowReleaseInProgress = true;

        const duration = game.time.time - this.bowLoadTime;
        const delay = Math.max(0, 200 - duration);
        const cooldown = 300;

        window.setTimeout(() => {
            this.upperBody.animations.play('release-bow');
            if (duration > 500) {
                this.fireChargedArrow(command.position);
            } else {
                this.fireArrowAt(command.position);
            }
        }, delay);

        window.setTimeout(() => {
            this.bowLoadInProgress = false;
            this.bowReleaseInProgress = false;
        }, delay + cooldown);
    }

    _fireArrowAt(position, arrow) {
        // Imagine a circle around the player.
        // We move the arrow to a point on the edge of that circle and then release it.

        const target = new Phaser.Point(
            game.camera.x + position.x,
            game.camera.y + position.y
        );

        const center = new Phaser.Point(
            this.physicsSprite.x,
            this.physicsSprite.y - 4
        );

        const radius = 16;
        const angle = center.angle(target);

        arrow.reset(
            center.x + radius * Math.cos(angle),
            center.y + radius * Math.sin(angle)
        );
        arrow.fireAt(target);
    }

    fireArrowAt(position) {
        const arrow = game.add.existing(new Arrow(game, 0, 0));
        if (arrow) {
            this._fireArrowAt(position, arrow);
        }
    }

    fireChargedArrow(position) {
        const arrow = game.add.existing(new Arrow(game, 0, 0, 5, true));
        if (arrow) {
            this._fireArrowAt(position, arrow);
        }
    }

    particleBurst(pointer) {

        // draw area where particles are displayed
        let poly = new Phaser.Polygon(75,-50, 75,15, -75,15, -75,-50);
        this.particleArea = game.add.graphics(pointer.x, pointer.y);
        this.particleArea.beginFill(0x000000);
        this.particleArea.drawPolygon(poly.points);
        this.particleArea.endFill();

        if (this.emitter.alive || this.emitter){
            //destroy prevously rendered emitter if exist
            this.emitter.destroy();
            this.emitter = game.add.emitter(0, 20, 38);
            this.emitter.makeParticles('blood');
        }

        this.emitter.x = pointer.x;
        this.emitter.y = pointer.y;
        this.emitter.area = new Phaser.Rectangle((pointer.x - 25) , (pointer.y - 25), 10, 10);
        this.emitter.gravity = 240;

        this.emitter.setYSpeed(-20,-50);
        this.emitter.bounce.setTo(1,0);
        this.emitter.mask = this.particleArea;
        this.emitter.minParticleScale = 1.1;
        this.emitter.maxParticleScale = 0.9;
        this.emitter.alpha = 1;
        this.emitter.forEach(function(particle) {  particle.tint = 0xff0000;});
        this.emitter.start(true, 2600, null, 10);
    }



    takeDamage(value) {

        //BLOOD!
        this.particleBurst(this.upperBody);

        if (!this.alive) return;
        this.health -= value;
        let perc = this.health / this.maxHealth;
        this.setBodyRed(perc);

        if (this.health <= 0) {
            this.alive = false;
            choice(deathSounds).play();
            game.camera.flash(0xff0000, 5000);
            game.showGameOver();
        } else {
            choice(hitSounds).play();
        }
    }

    setBodyRed(value) {
        // value should be a float [0..1]
        let channel = value * 255;
        let tint = (0xff << 16) + (channel << 8) + channel;
        this.upperBody.tint = tint;
        this.legsIdle.tint = tint;
        this.legsRunning.tint = tint;
    }

}
