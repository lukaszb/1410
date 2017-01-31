export class PointAtPosition {
    constructor(position) {
        this.position = position;
    }
}


export class MoveInDirection {
    constructor(direction) {
        this.direction = direction;
    }
}

export class AttackAtPosition {
    constructor(position, duration) {
        this.position = position;
        this.duration = duration;
    }
}


export class PrepareForAttack {
    constructor(position) {
        this.position = position;
    }
}


const up    = 1 << 0;
const down  = 1 << 1;
const left  = 1 << 2;
const right = 1 << 3;

export const Directions = {
    None: 0,

    Up: up,
    UpRight: up + right,
    Right: right,
    DownRight: down + right,
    Down: down,
    DownLeft: down + left,
    Left: left,
    UpLeft: up + left,
};


export class InputHandler {
    static getMousePointerCommand() {
        return new PointAtPosition(game.input.mousePointer.position);
    }

    static getMouseDownCommand() {
        let pointer = game.input.activePointer;
        return new PrepareForAttack(pointer.position);
    }

    static getMouseUpCommand() {
        let pointer = game.input.activePointer;

        // ignore some randomly generated events (like mouse enters game screen)
        if (pointer.duration > 0) {
            return new AttackAtPosition(pointer.position, pointer.duration);
        }
    }

    static getKeyboardCommands() {
        // "bind" keys, get direction
        const _ = Phaser.KeyCode;
        const keyboard = game.input.keyboard;
        const isUp    = keyboard.isDown(_.W) || keyboard.isDown(_.UP);
        const isDown  = keyboard.isDown(_.S) || keyboard.isDown(_.DOWN);
        const isLeft  = keyboard.isDown(_.A) || keyboard.isDown(_.LEFT);
        const isRight = keyboard.isDown(_.D) || keyboard.isDown(_.RIGHT);

        return [
            new MoveInDirection(
                (isUp    ? up    : (isDown ? down : 0)) +
                (isRight ? right : (isLeft ? left : 0))
            )
        ];
    }
}
