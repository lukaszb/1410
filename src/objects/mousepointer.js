const assetKey = 'mousePointer';
const assetKeyActive = 'mousePointerActive';


export default class MousePointer extends Phaser.Sprite {
    static preload() {
        game.load.image(assetKey, 'assets/cursor1.png');
        game.load.image(assetKeyActive, 'assets/cursor2.png');
    }

    constructor(game, x, y) {
        super(game, x, y, assetKey);

        this.anchor = new Phaser.Point(0.5, 0.3);
        game.input.onDown.add(this.setActiveState, this);
        game.input.onUp.add(this.setNormalState, this);
    }

    setActiveState() {
        this.loadTexture(assetKeyActive);
    }

    setNormalState() {
        this.loadTexture(assetKey);
    }

    update() {
        this.x = game.camera.x + game.input.mousePointer.x;
        this.y = game.camera.y + game.input.mousePointer.y;
    }
}
