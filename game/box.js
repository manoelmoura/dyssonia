import { GameObject } from "./gameObject.js";

export class Box extends GameObject {
    constructor(id, x, y, z, sizeX, sizeY, sizeZ, mass) {
        super(id, "box");
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.mass = mass;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}