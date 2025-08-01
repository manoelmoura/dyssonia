import { GameObject } from "./gameObject.js";

export class Door extends GameObject {
    constructor(id, x, y, z, targetRoomId, connectedDoorId = null, sizeX = 1, sizeY = 2, sizeZ = 0.2) {
        super(id, "door");
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.mass = Infinity; // Imóvel
        this.collision = false; // Sem colisão física
        this.targetRoomId = targetRoomId;
        this.connectedDoorId = connectedDoorId;
        this.cooldown = 0; // Evita spam de teleporte
    }
    
    onPlayerCollision(player, roomManager) {
        if (this.cooldown <= 0) {
            console.log(`Player ${player.id} usando porta para ${this.targetRoomId}, conectada com ${this.connectedDoorId}`);
            roomManager.switchToRoomNearDoor(this.targetRoomId, this.connectedDoorId, [player.id]);
            this.cooldown = 1; // 1 segundo de cooldown
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }
    }
}