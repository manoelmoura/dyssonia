import { Box } from "./box.js";

export class RoomManager {
    constructor(world, collisionSystem, gravitySystem) {
        this.rooms = new Map();
        this.activeRooms = new Set(); // Múltiplas salas podem estar ativas
        this.playerRooms = new Map(); // Rastreia qual sala cada jogador está
        this.world = world;
        this.collisionSystem = collisionSystem;
        this.gravitySystem = gravitySystem;

    }
    
    addRoom(room) {
        this.rooms.set(room.id, room);
        console.log(`Sala ${room.id} registrada`);
    }

    addBoxToRoom(roomId, x, y, z, sizeX = 1, sizeY = 1, sizeZ = 1, mass = 5) {
        const room = this.rooms.get(roomId);
        if (!room) {
            console.error(`Sala ${roomId} não encontrada`);
            return false;
        }
        
        const boxId = `${roomId}_box_${Date.now()}`; // ID único baseado no timestamp
        const box = new Box(boxId, x, y, z, sizeX, sizeY, sizeZ, mass);
        
        room.addObject(box);
        
        // Se a sala estiver ativa, adiciona a caixa aos sistemas
        if (this.activeRooms.has(roomId)) {
            this.world.addObject(box);
            this.collisionSystem.addObject(box);
            this.gravitySystem.addObject(box);
        }
        
        console.log(`Caixa ${boxId} adicionada à sala ${roomId}`);
        return box;
    }
    
    // Função original mantida para compatibilidade (quando todos devem ir juntos)
    switchToRoom(roomId, playersToMove = []) {
        const targetRoom = this.rooms.get(roomId);
        if (!targetRoom) {
            console.error(`Sala ${roomId} não encontrada`);
            return false;
        }
        
        // Desativa todas as salas ativas
        this.activeRooms.forEach(activeRoomId => {
            const room = this.rooms.get(activeRoomId);
            if (room) {
                room.deactivate(this.world, this.collisionSystem, this.gravitySystem);
            }
        });
        this.activeRooms.clear();
        
        // Ativa nova sala
        targetRoom.activate(this.world, this.collisionSystem, this.gravitySystem);
        this.activeRooms.add(roomId);
        
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
                this.playerRooms.set(playerId, roomId);
            }
        });
        
        console.log(`Mudou para sala: ${roomId}`);
        return true;
    }
    
    // Nova função para mover apenas um jogador específico
    movePlayerToRoom(playerId, roomId, connectedDoorId = null) {
        const targetRoom = this.rooms.get(roomId);
        const player = this.world.getObject(playerId);
        
        if (!targetRoom || !player) {
            console.error(`Sala ${roomId} ou jogador ${playerId} não encontrado`);
            return false;
        }
        
        // Ativa a sala de destino se não estiver ativa
        if (!this.activeRooms.has(roomId)) {
            targetRoom.activate(this.world, this.collisionSystem, this.gravitySystem);
            this.activeRooms.add(roomId);
            console.log(`Sala ${roomId} ativada`);
        }
        
        // Verifica se a sala anterior deve ser desativada
        const previousRoomId = this.playerRooms.get(playerId);
        if (previousRoomId && previousRoomId !== roomId) {
            // Conta quantos jogadores ainda estão na sala anterior
            const playersInPreviousRoom = Array.from(this.playerRooms.entries())
                .filter(([pId, rId]) => pId !== playerId && rId === previousRoomId)
                .length;
            
            // Se não há mais jogadores na sala anterior, desativa ela
            if (playersInPreviousRoom === 0) {
                const previousRoom = this.rooms.get(previousRoomId);
                if (previousRoom) {
                    previousRoom.deactivate(this.world, this.collisionSystem, this.gravitySystem);
                    this.activeRooms.delete(previousRoomId);
                    console.log(`Sala ${previousRoomId} desativada (sem jogadores)`);
                }
            }
        }
        
        // Move o jogador para a nova sala
        let spawnPoint;
        
        if (connectedDoorId) {
            // Procura a porta conectada na sala de destino
            const connectedDoor = targetRoom.objects.find(obj => obj.id === connectedDoorId);
            if (connectedDoor) {
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
        
        // Atualiza o mapeamento jogador-sala
        this.playerRooms.set(playerId, roomId);
        
        console.log(`Jogador ${playerId} movido para sala: ${roomId}`);
        return true;
    }
    
    // Função mantida para compatibilidade, mas agora usa movePlayerToRoom
    switchToRoomNearDoor(roomId, connectedDoorId, playersToMove = []) {
        // Se for apenas um jogador, usa a nova função
        if (playersToMove.length === 1) {
            return this.movePlayerToRoom(playersToMove[0], roomId, connectedDoorId);
        }
        
        // Para múltiplos jogadores, usa o comportamento antigo
        const targetRoom = this.rooms.get(roomId);
        if (!targetRoom) {
            console.error(`Sala ${roomId} não encontrada`);
            return false;
        }
        
        // Desativa todas as salas ativas
        this.activeRooms.forEach(activeRoomId => {
            const room = this.rooms.get(activeRoomId);
            if (room) {
                room.deactivate(this.world, this.collisionSystem, this.gravitySystem);
            }
        });
        this.activeRooms.clear();
        
        // Ativa nova sala
        targetRoom.activate(this.world, this.collisionSystem, this.gravitySystem);
        this.activeRooms.add(roomId);
        
        // Move players para perto da porta conectada
        playersToMove.forEach(playerId => {
            const player = this.world.getObject(playerId);
            if (player) {
                let spawnPoint;
                
                if (connectedDoorId) {
                    const connectedDoor = targetRoom.objects.find(obj => obj.id === connectedDoorId);
                    if (connectedDoor) {
                        spawnPoint = this.findBestSpawnPoint(connectedDoor);
                    }
                }
                
                if (!spawnPoint) {
                    spawnPoint = targetRoom.getSpawnPoint();
                }
                
                player.position.x = spawnPoint.x;
                player.position.y = spawnPoint.y;
                player.position.z = spawnPoint.z;
                player.velocity.x = 0;
                player.velocity.y = 0;
                player.velocity.z = 0;
                
                this.playerRooms.set(playerId, roomId);
            }
        });
        
        console.log(`Mudou para sala: ${roomId}`);
        return true;
    }
    
    addPlayerToCurrentRoom(playerId) {
        // Usa a primeira sala ativa ou ativa a primeira sala se nenhuma estiver ativa
        let roomToJoin = null;
        
        if (this.activeRooms.size > 0) {
            roomToJoin = Array.from(this.activeRooms)[0];
        } else {
            // Ativa a primeira sala disponível
            const firstRoom = Array.from(this.rooms.values())[0];
            if (firstRoom) {
                firstRoom.activate(this.world, this.collisionSystem, this.gravitySystem);
                this.activeRooms.add(firstRoom.id);
                roomToJoin = firstRoom.id;
            }
        }
        
        if (roomToJoin) {
            const room = this.rooms.get(roomToJoin);
            const spawnPoint = room.getSpawnPoint();
            const player = this.world.getObject(playerId);
            if (player) {
                player.position.x = spawnPoint.x;
                player.position.y = spawnPoint.y;
                player.position.z = spawnPoint.z;
                this.playerRooms.set(playerId, roomToJoin);
            }
        }
    }
    
    // Remove jogador do sistema quando desconecta
    removePlayer(playerId) {
        const roomId = this.playerRooms.get(playerId);
        this.playerRooms.delete(playerId);
        
        // Verifica se a sala deve ser desativada
        if (roomId) {
            const playersInRoom = Array.from(this.playerRooms.entries())
                .filter(([pId, rId]) => rId === roomId)
                .length;
            
            if (playersInRoom === 0) {
                const room = this.rooms.get(roomId);
                if (room) {
                    room.deactivate(this.world, this.collisionSystem, this.gravitySystem);
                    this.activeRooms.delete(roomId);
                    console.log(`Sala ${roomId} desativada (jogador desconectou)`);
                }
            }
        }
    }
    
    // Retorna em qual sala o jogador está
    getPlayerRoom(playerId) {
        return this.playerRooms.get(playerId);
    }
    
    // Retorna todos os jogadores em uma sala específica
    getPlayersInRoom(roomId) {
        return Array.from(this.playerRooms.entries())
            .filter(([playerId, playerRoomId]) => playerRoomId === roomId)
            .map(([playerId]) => playerId);
    }
    
    // Retorna todas as salas ativas
    getActiveRooms() {
        return Array.from(this.activeRooms);
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
        
        // Primeiro, determina qual sala contém este ponto
        let targetRoom = null;
        this.activeRooms.forEach(roomId => {
            const room = this.rooms.get(roomId);
            if (room && room.containsPoint(x, z)) {
                targetRoom = room;
            }
        });
        
        // Se encontrou a sala, pega apenas os objetos dela
        if (targetRoom) {
            targetRoom.objects.forEach(obj => {
                if (obj.type === 'floor' || obj.mass === Infinity) {
                    groundObjects.push(obj);
                }
            });
        } else {
            // Fallback: pega objetos de todas as salas ativas
            this.activeRooms.forEach(roomId => {
                const room = this.rooms.get(roomId);
                if (room) {
                    room.objects.forEach(obj => {
                        if (obj.type === 'floor' || obj.mass === Infinity) {
                            groundObjects.push(obj);
                        }
                    });
                }
            });
        }
        
        // Simula raycasting manual
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