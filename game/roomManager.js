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
                        // Encontra o melhor spawn point verificando o chão
                        spawnPoint = this.findBestSpawnPoint(connectedDoor);
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

    findBestSpawnPoint(door) {
        // Possíveis posições ao redor da porta
        const testPositions = [
            { x: door.position.x, z: door.position.z + 2 }, // Frente
            { x: door.position.x, z: door.position.z - 2 }, // Atrás
            { x: door.position.x + 2, z: door.position.z }, // Direita
            { x: door.position.x - 2, z: door.position.z }, // Esquerda
            { x: door.position.x + 1.5, z: door.position.z + 1.5 }, // Diagonal
            { x: door.position.x - 1.5, z: door.position.z + 1.5 },
            { x: door.position.x + 1.5, z: door.position.z - 1.5 },
            { x: door.position.x - 1.5, z: door.position.z - 1.5 }
        ];
        
        // Testa cada posição para encontrar chão
        for (const testPos of testPositions) {
            const groundY = this.findGroundAt(testPos.x, testPos.z);
            
            if (groundY !== null) {
                return {
                    x: testPos.x,
                    y: groundY + 0.5, // 0.5 unidades acima do chão
                    z: testPos.z
                };
            }
        }
        
        // Se não encontrou chão em lugar nenhum, usa posição padrão da porta
        return {
            x: door.position.x,
            y: door.position.y,
            z: door.position.z + 2
        };
    }

    findGroundAt(x, z) {
        // Cria um raycaster apontando para baixo
        const rayOrigin = { x: x, y: 10, z: z }; // Começa 10 unidades acima
        const rayDirection = { x: 0, y: -1, z: 0 }; // Aponta para baixo
        
        // Verifica colisão com objetos que podem ser chão
        const groundObjects = [];
        
        // Pega objetos da sala atual que podem servir de chão
        if (this.currentRoom) {
            this.currentRoom.objects.forEach(obj => {
                if (obj.type === 'floor' || obj.mass === Infinity) {
                    groundObjects.push(obj);
                }
            });
        }
        
        // Simula raycasting manual (já que não temos Three.js aqui)
        for (const obj of groundObjects) {
            if (this.rayIntersectsAABB(rayOrigin, rayDirection, obj)) {
                // Retorna o topo do objeto como altura do chão
                return obj.position.y + (obj.sizeY / 2);
            }
        }
        
        return null; // Não encontrou chão
    }

    rayIntersectsAABB(rayOrigin, rayDirection, aabb) {
        // Calcula os limites da AABB
        const minX = aabb.position.x - (aabb.sizeX / 2);
        const maxX = aabb.position.x + (aabb.sizeX / 2);
        const minY = aabb.position.y - (aabb.sizeY / 2);
        const maxY = aabb.position.y + (aabb.sizeY / 2);
        const minZ = aabb.position.z - (aabb.sizeZ / 2);
        const maxZ = aabb.position.z + (aabb.sizeZ / 2);
        
        // Verifica se o raio está dentro dos limites X e Z
        if (rayOrigin.x >= minX && rayOrigin.x <= maxX &&
            rayOrigin.z >= minZ && rayOrigin.z <= maxZ) {
            
            // Verifica se o raio pode atingir a AABB no eixo Y
            if (rayOrigin.y >= maxY) {
                return true; // Raio vem de cima e pode atingir o topo da AABB
            }
        }
        
        return false;
    }
}