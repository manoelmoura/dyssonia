export class GameObject {
    constructor(id, type = "generic") {
        this.id = id;
        this.type = type;
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.sizeX = 1;
        this.sizeY = 1;
        this.sizeZ = 1;
        this.mass = 1;
    }

    update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
    }
}