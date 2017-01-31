import {getRangeArray} from '../utils';


const ASSET_KEY = 'arrow';
const EXPLOSION = 'explosion';

let fireArrowSound;


export default class Arrow extends Phaser.Sprite {
    static preload(game) {
        game.load.image(ASSET_KEY, 'assets/simple-arrow.png');
        game.load.image('fire-pixel', 'assets/fire-pixel.png');
        game.load.spritesheet('explosion', 'assets/explosion-2.png', 64, 64);
        game.load.audio('fire-arrow', ['assets/sounds/bow_hit.mp3', 'assets/sounds/bow_hit.ogg']);
    }

    constructor(game, x, y, damageAmount, isCharged) {
        super(game, x, y, ASSET_KEY);
        this.damageAmount = damageAmount || 1;
        this.isCharged = !!isCharged;

        game.physics.p2.enable(this);
        this.body.setCollisionGroup(game.collider.ARROW_COLLISION_GROUP);
        this.body.fixedRotation = true;
        this.body.collides(game.collider.ENEMY_COLLISION_GROUP, this.hitTarget, this);
        this.body.collideWorldBounds = false;
        this.firedAtPosition = null;

        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        if (!fireArrowSound) {
            fireArrowSound = game.add.audio('fire-arrow');
        }
        this.setupEmitter();

        this.setupAnimations();
    }

    update() {
        this.emitter.x = this.x;
        this.emitter.y = this.y;
    }

    fireAt(position) {
        this.rotation = this.position.angle(position);

        const speed = 700;
        const vector = Phaser.Point.subtract(position, this.position).normalize();

        this.body.velocity.x = speed * vector.x;
        this.body.velocity.y = speed * vector.y;
        fireArrowSound.play();

        if (this.isCharged) {
            this.emitter.visible = true;
        }
    }

    hitTarget(arrowBody, otherBody) {
        if (!this.alive || !this.body) { return; }
        if (this.isCharged) {
            this.playExplosion();
        }
        this.emitter.visible = false;

        // damage the enemy
        otherBody.sprite.gotHit(this);
        this.body.destroy();
    }

    setupEmitter() {
        this.emitter = this.game.add.emitter(this.x, this.y, 20);
        this.emitter.gravity = 800;
        this.emitter.makeParticles(['fire-pixel']);
        this.emitter.setAlpha(0.6, 1, 250);
        this.emitter.setScale(0.8, 0, 0.8, 0, 2000);

        this.emitter.start(false, 250, 5);
        this.emitter.visible = false;
    }

    setupAnimations() {
        this.explosionSprite = this.game.add.sprite(0, 0, EXPLOSION);
        this.explosionSprite.anchor.setTo(0.5, 0.5);
        let frames = getRangeArray(8);
        let fps = 20;
        let shouldLoop = false;
        this.explosionSprite.animations.add('explosion', frames, fps, shouldLoop);
        this.explosionSprite.visible = false;
    }

    playExplosion() {
        this.explosionSprite.visible = true;
        this.explosionSprite.x = this.x;
        this.explosionSprite.y = this.y;
        this.explosionSprite.animations.stop();
        let anim = this.explosionSprite.animations.play('explosion');
        anim.onComplete.add(function() {
            this.explosionSprite.visible = false;
        }, this);
    }

}
