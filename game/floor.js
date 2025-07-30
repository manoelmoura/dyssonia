import { GameObject } from "./gameObject.js";

export class Floor extends GameObject {
    constructor(id, x, y, z, size) {
        super(id, "floor")
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.size = size;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}