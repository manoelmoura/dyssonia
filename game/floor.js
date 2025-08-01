import { GameObject } from "./gameObject.js";

export class Floor extends GameObject {
    constructor(id, x, y, z, sizeX, sizeY, sizeZ) {
        super(id, "floor")
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.mass = 100;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}