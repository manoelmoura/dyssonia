import { GameObject } from "./gameObject.js";

export class Wall extends GameObject {
    constructor(id, x, y, z, sizeX, sizeY, sizeZ) {
        super(id, "wall");
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.mass = Infinity; // Massa infinita para ser imóvel
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}