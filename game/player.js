import { GameObject } from './gameObject.js';

export class Player extends GameObject {
    constructor(id, username) {
        super(id, "player");
        this.username = username;
        this.hp = 100;
        this.speed = 0.3;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}