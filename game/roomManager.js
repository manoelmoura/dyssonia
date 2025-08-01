export class RoomManager {
    constructor(world, collisionSystem, gravitySystem) {
        this.rooms = new Map();
        this.currentRoom = null;
        this.world = world;
        this.collisionSystem = collisionSystem;
        this.gravitySystem = gravitySystem;
        this.players = new Map(); // Rastreia players ativos
    }
    
    addRoom(room) {
        this.rooms.set(room.id, room);
        console.log(`Sala ${room.id} registrada`);
    }
    
    switchToRoom(roomId, playersToMove = []) {
        const targetRoom = this.rooms.get(roomId);
        if (!targetRoom) {
            console.error(`Sala ${roomId} não encontrada`);
            return false;
        }
        
        // Desativa sala atual
        if (this.currentRoom) {
            this.currentRoom.deactivate(this.world, this.collisionSystem, this.gravitySystem);
        }
        
        // Ativa nova sala
        targetRoom.activate(this.world, this.collisionSystem, this.gravitySystem);
        this.currentRoom = targetRoom;
        
        // Move players para spawn point da nova sala
        const spawnPoint = targetRoom.getSpawnPoint();
        playersToMove.forEach(playerId => {
            const player = this.world.getObject(playerId);
            if (player) {
                player.position.x = spawnPoint.x;
                player.position.y = spawnPoint.y;
                player.position.z = spawnPoint.z;
                player.velocity.x = 0;
                player.velocity.y = 0;
                player.velocity.z = 0;
            }
        });
        
        console.log(`Mudou para sala: ${roomId}`);
        return true;
    }
    
    switchToRoomNearDoor(roomId, connectedDoorId, playersToMove = []) {
        const targetRoom = this.rooms.get(roomId);
        if (!targetRoom) {
            console.error(`Sala ${roomId} não encontrada`);
            return false;
        }
        
        // Desativa sala atual
        if (this.currentRoom) {
            this.currentRoom.deactivate(this.world, this.collisionSystem, this.gravitySystem);
        }
        
        // Ativa nova sala
        targetRoom.activate(this.world, this.collisionSystem, this.gravitySystem);
        this.currentRoom = targetRoom;
        
        // Move players para perto da porta conectada
        playersToMove.forEach(playerId => {
            const player = this.world.getObject(playerId);
            if (player) {
                let spawnPoint;
                
                if (connectedDoorId) {
                    // Procura a porta conectada na sala de destino
                    const connectedDoor = targetRoom.objects.find(obj => obj.id === connectedDoorId);
                    if (connectedDoor) {
                        // Spawna um pouco à frente da porta (offset de 2 unidades)
                        spawnPoint = {
                            x: connectedDoor.position.x,
                            y: connectedDoor.position.y,
                            z: connectedDoor.position.z + 2 // 2 unidades na frente da porta
                        };
                    }
                }
                
                // Se não encontrou porta conectada, usa spawn padrão da sala
                if (!spawnPoint) {
                    spawnPoint = targetRoom.getSpawnPoint();
                }
                
                player.position.x = spawnPoint.x;
                player.position.y = spawnPoint.y;
                player.position.z = spawnPoint.z;
                player.velocity.x = 0;
                player.velocity.y = 0;
                player.velocity.z = 0;
            }
        });
        
        console.log(`Mudou para sala: ${roomId}`);
        return true;
    }
    
    addPlayerToCurrentRoom(playerId) {
        if (this.currentRoom) {
            const spawnPoint = this.currentRoom.getSpawnPoint();
            const player = this.world.getObject(playerId);
            if (player) {
                player.position.x = spawnPoint.x;
                player.position.y = spawnPoint.y;
                player.position.z = spawnPoint.z;
            }
        }
    }
}