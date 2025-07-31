import { GameObject } from './gameObject.js';

export class Player extends GameObject {
    constructor(id, username) {
        super(id, "player");
        this.username = username;
        this.hp = 100;
        this.speed = 20;
        this.sizeX = 1;
        this.sizeY = 1;
        this.sizeZ = 1;

        this.position.y = 0
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}