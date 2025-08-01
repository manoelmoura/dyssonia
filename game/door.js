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
        this.playerCooldowns = new Map(); // Cooldown individual por jogador
    }
    
    onPlayerCollision(player, roomManager) {
        // Verifica cooldown individual do jogador
        const playerCooldown = this.playerCooldowns.get(player.id) || 0;
        
        if (playerCooldown <= 0) {
            console.log(`Player ${player.id} usando porta para ${this.targetRoomId}, conectada com ${this.connectedDoorId}`);
            
            // Usa a nova função que move apenas este jogador específico
            roomManager.movePlayerToRoom(player.id, this.targetRoomId, this.connectedDoorId);
            
            // Define cooldown individual para este jogador
            this.playerCooldowns.set(player.id, 1); // 1 segundo de cooldown
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Atualiza cooldown global (mantido para compatibilidade)
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }
        
        // Atualiza cooldowns individuais dos jogadores
        for (const [playerId, cooldown] of this.playerCooldowns.entries()) {
            if (cooldown > 0) {
                this.playerCooldowns.set(playerId, cooldown - deltaTime);
            } else {
                this.playerCooldowns.delete(playerId); // Remove cooldown expirado
            }
        }
    }
}