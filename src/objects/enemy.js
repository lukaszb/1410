import {getSoundFiles, choice, getRangeArray, getRangeWithRandomStart} from '../utils';


const assetKeys = {
    IDLE: 'skeleton-idle',
    RUN: 'skeleton-running',
    ATTACK: 'skeleton-attack',
    SHADOW: 'skeleton-shadow',
    DEATH: 'skeleton-death',
};

let hitSounds;
let deathSounds;
let attackSound;

export default class Enemy extends Phaser.Sprite {



    static preload(game) {
        game.load.spritesheet(assetKeys.RUN, 'assets/skeleton-run.png', 50, 50);
        game.load.spritesheet(assetKeys.IDLE, 'assets/skeleton-idle.png', 50, 50);
        game.load.spritesheet(assetKeys.ATTACK, 'assets/skeleton-attack.png', 50, 50);
        game.load.spritesheet(assetKeys.DEATH, 'assets/skeleton-death.png', 50, 50);
        game.load.spritesheet(assetKeys.SHADOW, 'assets/shadow.png', 50, 50);
    	game.load.image('bones', 'assets/pixel.png');

        game.load.physics('skeletonPhysics', 'assets/shapes.json');
        game.load.audio('enemy-hit1', getSoundFiles('hit1'));
        game.load.audio('enemy-hit2', getSoundFiles('hit2'));
        game.load.audio('enemy-hit3', getSoundFiles('hit3'));
        game.load.audio('enemy-death1', getSoundFiles('skeleton_death'));
        game.load.audio('enemy-death2', getSoundFiles('skeleton_death2'));
        game.load.audio('enemy-sword', getSoundFiles('swish1'));
    }

    constructor(game, x, y) {
        super(game, x, y, assetKeys.IDLE);

        this.health = this.maxHealth = 5;
        this.speed = (50 + Math.random() * 50) | 0;
        this.arrows = [];

        this.shadow = game.add.existing(new Phaser.Sprite(game, x, y, assetKeys.SHADOW));
        this.shadow.anchor.x = 0.5;
        this.shadow.anchor.y = 0.5;

        game.physics.p2.enable(this);
        this.body.clearShapes();
        this.body.loadPolygon('skeletonPhysics', 'skeleton-running');
        this.body.fixedRotation = true;
        this.body.setCollisionGroup(game.collider.ENEMY_COLLISION_GROUP);
        this.body.collides([
            game.collider.STATIC_COLLISION_GROUP,
            game.collider.PLAYER_COLLISION_GROUP,
            game.collider.ENEMY_COLLISION_GROUP,
            game.collider.ARROW_COLLISION_GROUP,
        ]);

        this.setupAnimations();

        /* particles */
        this.emitter = game.add.emitter(0, 0, 100);

        this.emitter.makeParticles('bones');
        this.emitter.gravity = 200;

        if (!hitSounds) {
            hitSounds = [
                game.add.audio('enemy-hit1'),
                game.add.audio('enemy-hit2'),
                game.add.audio('enemy-hit3'),
            ];
        }

        if (!deathSounds) {
            deathSounds = [
                game.add.audio('enemy-death1'),
                game.add.audio('enemy-death2'),
            ];
        }

        // hitbox
        this.hitbox = new Phaser.Sprite(game, 0, 0, null);
        game.physics.p2.enable(this.hitbox);
        game.add.existing(this.hitbox);
        this.hitbox.body.clearShapes();
        this.hitbox.body.addCircle(14, 0, -10);
        this.hitbox.body.setCollisionGroup(game.collider.ENEMY_SWORD_ATTACK_COLLISION_GROUP);
        this.hitbox.body.collides([game.collider.PLAYER_COLLISION_GROUP], this.hitPlayer.bind(this));

        this.setState(assetKeys.IDLE);
        this.wasAttacked = false;
        game.enemies.push(this);
    }

    update() {
        this.updateShadowPosition();
        if (this.alive) {
            this.updateHitbox();
        }

        if (!this.alive) return;

        var playerCenter = new Phaser.Point(
            game.player.physicsSprite.position.x,
            game.player.physicsSprite.position.y + 25
        );
        var vector = Phaser.Point.subtract(this.position, playerCenter);
        var distance = vector.distance(new Phaser.Point());

        const tolerance = 1;
        const shouldFaceLeft = vector.x > tolerance;
        if (shouldFaceLeft) {
            this.scale.x = 1;
        } else {
            this.scale.x = -1;
        }

        let closeDistance = 30;
        let sightDistance = 210;
        this.wasAttacked = this.wasAttacked || this.health < this.maxHealth;

        let vx = 0;
        let vy = 0;

        if (distance < closeDistance) {
            this.setState(assetKeys.ATTACK);
        } else if (distance <= sightDistance || this.wasAttacked) {
            this.setState(assetKeys.RUN);
            const normal = vector.normalize();
            vx = this.speed * -normal.x;
            vy = this.speed * -normal.y;
        } else {
            this.setState(assetKeys.IDLE);
        }

        const inertia = 0.5;
        const body = this.body;
        body.velocity.x = 0 | (inertia * body.velocity.x + (1 - inertia) * vx);
        body.velocity.y = 0 | (inertia * body.velocity.y + (1 - inertia) * vy);

        if (this.arrows.length > 0) {
            const p1 = this.previousPosition;
            const p2 = this.position;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            this.arrows.forEach((arrow) => {
                arrow.x += dx;
                arrow.y += dy;
            });
        }
    }

    updateShadowPosition() {
        this.shadow.x = this.x;
        this.shadow.y = this.y + 22;
    }

    updateHitbox() {
        let pos = this.getHitboxPosition();
        this.hitbox.body.x = pos.x;
        this.hitbox.body.y = pos.y;
    }

    particleBurst(pointer) {

        // draw area where particles are displayed
        var poly = new Phaser.Polygon();
        poly.setTo([ new Phaser.Point(75,-50), new Phaser.Point(75,15), new Phaser.Point(-75,15), new Phaser.Point(-75,-50) ]);
        this.particleArea = game.add.graphics(pointer.x, pointer.y);
        this.particleArea.beginFill(0x000000);
        this.particleArea.drawPolygon(poly.points);
        this.particleArea.endFill();

        if (this.emitter.alive || this.emitter){
            //destroy prevously rendered emitter if exist
            this.emitter.destroy();
            this.emitter = game.add.emitter(0, 20, 38);
            this.emitter.makeParticles('bones');
        }

        this.emitter.x = pointer.x;
        this.emitter.y = pointer.y;
        this.emitter.area = new Phaser.Rectangle((pointer.x - 25) , (pointer.y - 25), 10, 10);
        this.emitter.gravity = 240;

        //this.emitter.maxParticleSpeed.setTo(-50 * this.scale.x, 10 * this.scale.x);
        this.emitter.setYSpeed(-20,-50);
        this.emitter.setXSpeed(-30 * this.scale.x, -60 * this.scale.x);
        this.emitter.bounce.setTo(1,0);
        this.emitter.mask = this.particleArea;
        this.emitter.minParticleScale = 1.1;
        this.emitter.maxParticleScale = 0.9;
        this.emitter.alpha = 1;
        //this.emitter.forEach(function(particle) {  particle.tint = 0xffffff;});
        this.emitter.start(true, 2600, null, 10);
    }


    destroyEmitter() {
        //this.emitter.destroy();
    }

    setState(state) {
        this.disableHitbox();
        if (state === this.state) return;
        this.state = state;
        if (state === assetKeys.RUN) {
            this.playRun();
        } else if (state === assetKeys.IDLE) {
            this.playIdle();
        } else if (state === assetKeys.ATTACK) {
            let anim = this.playAttack();
            anim.onLoop.add(this.attack, this);
        }
    }

    attack() {
        this.enableHitbox();
    }

    setupAnimations() {
        this.addRunAnimation();
        this.addIdleAnimation();
        this.addAttackAnimation();
        this.addDeathAnimation();
    }

    addIdleAnimation() {
        this.loadTexture(assetKeys.IDLE);
        let frames = getRangeWithRandomStart(4);
        let fps = 12;
        let shouldLoop = true;
        this.animations.add(assetKeys.IDLE, frames, fps, shouldLoop);
    }

    addRunAnimation() {
        this.loadTexture(assetKeys.RUN);
        let frames = getRangeWithRandomStart(6);
        let fps = 16;
        let shouldLoop = true;
        this.animations.add(assetKeys.RUN, frames, fps, shouldLoop);
    }

    addAttackAnimation() {
        this.loadTexture(assetKeys.ATTACK);
        let frames = getRangeArray(11);
        let fps = 16;
        let shouldLoop = true;
        this.animations.add(assetKeys.ATTACK, frames, fps, shouldLoop);
    }

    addDeathAnimation() {
        this.loadTexture(assetKeys.DEATH);
        let frames = getRangeArray(8);
        let fps = 12;
        let shouldLoop = false;
        this.animations.add(assetKeys.DEATH, frames, fps, shouldLoop);
    }

    playIdle() {
        this.playAnimation(assetKeys.IDLE);
    }

    playRun() {
        this.playAnimation(assetKeys.RUN);
    }

    playAttack() {
        if (!attackSound) {
            attackSound = game.add.audio('enemy-sword');
        }
        attackSound.volume = 0.5;
        attackSound.play();

        return this.playAnimation(assetKeys.ATTACK);
    }

    playDeath() {
        this.playAnimation(assetKeys.DEATH);
    }

    playAnimation(name) {
        this.loadTexture(name);
        this.animations.stop(null, true);
        return this.animations.play(name);
    }

    gotHit(arrow) {
        const damageAmount = arrow.damageAmount;
        const angle = arrow.rotation;

        // "catch" the arrow
        if (Math.random() < 0.2) {
            this.arrows.push(arrow);

            const r = -8;
            const a = arrow.rotation;
            const randomX = 4 * (Math.random() - 0.5);
            const randomY = 4 * (Math.random() - 0.5);
            arrow.x = this.x + randomX + r * Math.cos(a);
            arrow.y = this.y + randomY + r * Math.sin(a) + 9;
        } else {
            arrow.kill();
        }

        // take damage
        this.damage(damageAmount);

        this.particleBurst(this);

        // push back
        const distance = damageAmount === 1 ? 20 : 30;
        const duration = 32;
        const dx = distance * Math.cos(angle);
        const dy = distance * Math.sin(angle);
        game.add.tween(this.body || this).to({
            x: (dx > 0 ? '+' : '-') + Math.abs(dx),
            y: (dy > 0 ? '+' : '-') + Math.abs(dy),
        }, duration, Phaser.Easing.Bounce.Out, true);

        // tint
        if (this.health <= 0) {
            this.tint = damageAmount === 1 ? 0xbbbbbb : 0x555555;
        } else {
            const percentageRed = 60 * (1 - this.health / this.maxHealth);
            const channel = ((100 - percentageRed) / 100 * 255) | 0;
            this.tint = (0xff << 16) + (channel << 8) + channel;
        }

        // make noise
        choice(hitSounds).play();

        // alert any nearby enemies too
        let alertThreshold = 75;
        for (let enemy of game.enemies) {
            if (this.position.distance(enemy.position) <= alertThreshold) {
                enemy.wasAttacked = true;
            }
        }
    }

    kill() {
        this.alive = false;
        this.body.destroy();
        this.playDeath();
        choice(deathSounds).play();
        this.hitbox.destroy();
        this.arrows.forEach((arrow) => arrow.kill());
    }


    facesLeft() {
        return this.scale.x === 1;
    }

    facesRight() {
        return !this.facesLeft();
    }

    enableHitbox() {
        let pos = this.getHitboxPosition();
        this.hitbox.reset(pos.x, pos.y);
    }

    getHitboxPosition() {
        let pos = new Phaser.Point(this.body.x, this.body.y + 20);
        let delta = 20;
        if (this.facesLeft()) {
            pos.x -= delta;
        } else {
            pos.x += delta;
        }
        return pos;
    }

    disableHitbox() {
        this.hitbox.kill();
    }

    hitPlayer() {
        this.game.player.takeDamage(30);
    }
}
