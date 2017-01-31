

export default class Collider {
    constructor(game) {
        this.game = game;

        this.STATIC_COLLISION_GROUP             = game.physics.p2.createCollisionGroup();
        this.PLAYER_COLLISION_GROUP             = game.physics.p2.createCollisionGroup();
        this.ENEMY_COLLISION_GROUP              = game.physics.p2.createCollisionGroup();
        this.ENEMY_SWORD_ATTACK_COLLISION_GROUP = game.physics.p2.createCollisionGroup();
        this.ARROW_COLLISION_GROUP              = game.physics.p2.createCollisionGroup();

    }
}
