import { Room } from './room.js';
import { Door } from './door.js';

export class DungeonGenerator {
    constructor(roomManager) {
        this.roomManager = roomManager;
        this.rooms = new Map();
        this.connections = [];
        this.roomSpacing = 500; // Distância entre salas
        this.minDoorDistance = 2; // Distância mínima entre portas
    }

    generateDungeon(numRooms = 5) {
        this.rooms.clear();
        this.connections = [];
        
        // Gera as salas com posicionamento em grid
        const gridSize = Math.ceil(Math.sqrt(numRooms));
        let roomIndex = 0;
        
        for (let row = 0; row < gridSize && roomIndex < numRooms; row++) {
            for (let col = 0; col < gridSize && roomIndex < numRooms; col++) {
                const roomId = `room_${roomIndex}`;
                const sizeX = this.randomBetween(10, 40);
                const sizeZ = this.randomBetween(10, 40);
                
                // Calcula posição absoluta da sala
                const worldX = col * this.roomSpacing;
                const worldZ = row * this.roomSpacing;
                
                const room = new Room(roomId, sizeX, sizeZ, worldX, worldZ);
                this.rooms.set(roomId, room);
                this.roomManager.addRoom(room);
                
                console.log(`Sala ${roomId} criada na posição (${worldX}, ${worldZ})`);
                roomIndex++;
            }
        }
        
        // Conecta todas as salas em linha (cada sala conecta com a próxima)
        const roomIds = Array.from(this.rooms.keys());
        for (let i = 0; i < roomIds.length - 1; i++) {
            this.connectRooms(roomIds[i], roomIds[i + 1]);
        }
        
        // Adiciona algumas conexões extras aleatórias
        const extraConnections = Math.floor(numRooms / 3);
        for (let i = 0; i < extraConnections; i++) {
            const room1Id = roomIds[Math.floor(Math.random() * roomIds.length)];
            const room2Id = roomIds[Math.floor(Math.random() * roomIds.length)];
            
            if (room1Id !== room2Id && !this.areRoomsConnected(room1Id, room2Id)) {
                this.connectRooms(room1Id, room2Id);
            }
        }
        
        console.log(`Dungeon gerada com ${numRooms} salas e ${this.connections.length} conexões`);
        
        // Ativa a primeira sala
        if (roomIds.length > 0) {
            // Usa a nova função que move apenas jogadores existentes
            this.roomManager.switchToRoom(roomIds[0], []);
        }
        
        return {
            rooms: this.rooms,
            connections: this.connections
        };
    }
    
    connectRooms(roomId1, roomId2) {
        const room1 = this.rooms.get(roomId1);
        const room2 = this.rooms.get(roomId2);
        
        if (!room1 || !room2) return;
        
        // Gera IDs únicos para as portas
        const door1Id = `door_${roomId1}_to_${roomId2}`;
        const door2Id = `door_${roomId2}_to_${roomId1}`;
        
        // Calcula a direção entre as salas para posicionar portas inteligentemente
        const deltaX = room2.worldX - room1.worldX;
        const deltaZ = room2.worldZ - room1.worldZ;
        
        let door1Wall, door2Wall;
        
        // Determina as paredes baseado na posição relativa das salas
        if (Math.abs(deltaX) > Math.abs(deltaZ)) {
            // Salas estão mais separadas horizontalmente
            if (deltaX > 0) {
                door1Wall = 'east';
                door2Wall = 'west';
            } else {
                door1Wall = 'west';
                door2Wall = 'east';
            }
        } else {
            // Salas estão mais separadas verticalmente
            if (deltaZ > 0) {
                door1Wall = 'north';
                door2Wall = 'south';
            } else {
                door1Wall = 'south';
                door2Wall = 'north';
            }
        }

        // Cria porta na sala 1 (posição relativa à sala)
        const door1Position = this.getDoorPositionOnWall(room1, door1Wall);
        const door1 = new Door(
            door1Id,
            door1Position.x, // Posição relativa
            door1Position.y,
            door1Position.z, // Posição relativa
            roomId2,
            door2Id
        );
        room1.addObject(door1); // addObject vai converter para posição absoluta

        // Cria porta na sala 2 (posição relativa à sala)
        const door2Position = this.getDoorPositionOnWall(room2, door2Wall);
        const door2 = new Door(
            door2Id,
            door2Position.x, // Posição relativa
            door2Position.y,
            door2Position.z, // Posição relativa
            roomId1,
            door1Id
        );
        room2.addObject(door2); // addObject vai converter para posição absoluta
        
        // Registra a conexão
        this.connections.push({
            room1: roomId1,
            room2: roomId2,
            door1: door1Id,
            door2: door2Id
        });
        
        console.log(`Conectadas salas ${roomId1} e ${roomId2} (${door1Wall} -> ${door2Wall})`);
    }
    
    getOppositeWall(wall) {
        const opposites = {
            'north': 'south',
            'south': 'north',
            'east': 'west',
            'west': 'east'
        };
        return opposites[wall];
    }

    getDoorPositionOnWall(room, wall) {
        const doorHeight = 1;
        let x, z;
        
        // Busca uma posição válida que respeite a distância mínima
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            // Posições relativas à sala (sem worldX/worldZ)
            switch (wall) {
                case 'north':
                    x = this.randomBetween(-room.sizeX/3, room.sizeX/3);
                    z = room.sizeZ/2 - 0.1;
                    break;
                case 'south':
                    x = this.randomBetween(-room.sizeX/3, room.sizeX/3);
                    z = -room.sizeZ/2 + 0.1;
                    break;
                case 'east':
                    x = room.sizeX/2 - 0.1;
                    z = this.randomBetween(-room.sizeZ/3, room.sizeZ/3);
                    break;
                case 'west':
                    x = -room.sizeX/2 + 0.1;
                    z = this.randomBetween(-room.sizeZ/3, room.sizeZ/3);
                    break;
            }
            
            attempts++;
            
        } while (!this.isValidDoorPosition(room, x, z, wall) && attempts < maxAttempts);
        
        // Se não conseguiu encontrar uma posição válida, usa uma posição padrão
        if (attempts >= maxAttempts) {
            console.warn(`Não foi possível encontrar posição válida para porta na sala ${room.id}, usando posição padrão`);
            switch (wall) {
                case 'north':
                    x = 0;
                    z = room.sizeZ/2 - 0.1;
                    break;
                case 'south':
                    x = 0;
                    z = -room.sizeZ/2 + 0.1;
                    break;
                case 'east':
                    x = room.sizeX/2 - 0.1;
                    z = 0;
                    break;
                case 'west':
                    x = -room.sizeX/2 + 0.1;
                    z = 0;
                    break;
            }
        }
        
        return { x, y: doorHeight, z };
    }
    
    // Verifica se a posição da porta respeita a distância mínima das outras portas
    isValidDoorPosition(room, x, z, wall) {
        // Converte posição relativa para absoluta para comparação
        const absoluteX = room.worldX + x;
        const absoluteZ = room.worldZ + z;
        
        // Verifica distância de todas as portas existentes na sala
        for (const obj of room.objects) {
            if (obj.type === 'door') {
                const distance = Math.sqrt(
                    Math.pow(obj.position.x - absoluteX, 2) + 
                    Math.pow(obj.position.z - absoluteZ, 2)
                );
                
                if (distance < this.minDoorDistance) {
                    return false;
                }
            }
        }
        
        // Verifica se a posição está muito próxima dos cantos da parede
        const cornerDistance = 2; // Distância mínima dos cantos
        
        switch (wall) {
            case 'north':
            case 'south':
                // Para paredes norte/sul, verifica distância das bordas X
                if (Math.abs(x) > (room.sizeX/2 - cornerDistance)) {
                    return false;
                }
                break;
            case 'east':
            case 'west':
                // Para paredes leste/oeste, verifica distância das bordas Z
                if (Math.abs(z) > (room.sizeZ/2 - cornerDistance)) {
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    areRoomsConnected(roomId1, roomId2) {
        return this.connections.some(conn => 
            (conn.room1 === roomId1 && conn.room2 === roomId2) ||
            (conn.room1 === roomId2 && conn.room2 === roomId1)
        );
    }
    
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Função para gerar uma dungeon com layout específico
    generateLinearDungeon(numRooms = 3) {
        this.rooms.clear();
        this.connections = [];
        
        for (let i = 0; i < numRooms; i++) {
            const roomId = `linear_room_${i}`;
            const sizeX = this.randomBetween(10, 14);
            const sizeZ = this.randomBetween(10, 14);
            
            // Posiciona salas em linha horizontal
            const worldX = i * this.roomSpacing;
            const worldZ = 0;
            
            const room = new Room(roomId, sizeX, sizeZ, worldX, worldZ);
            this.rooms.set(roomId, room);
            this.roomManager.addRoom(room);
            
            // Conecta com a sala anterior
            if (i > 0) {
                const prevRoomId = `linear_room_${i-1}`;
                this.connectRooms(prevRoomId, roomId);
            }
        }
        
        console.log(`Dungeon linear gerada com ${numRooms} salas`);
        
        // Ativa a primeira sala
        if (numRooms > 0) {
            this.roomManager.switchToRoom('linear_room_0', []);
        }
        
        return {
            rooms: this.rooms,
            connections: this.connections
        };
    }
    
    // Função para gerar uma dungeon em formato de cruz
    generateCrossDungeon() {
        this.rooms.clear();
        this.connections = [];
        
        const spacing = this.roomSpacing;
        
        // Sala central na origem
        const centralRoom = new Room('center', 12, 12, 0, 0);
        this.rooms.set('center', centralRoom);
        this.roomManager.addRoom(centralRoom);
        
        // 4 salas ao redor com posicionamento específico
        const roomConfigs = [
            { id: 'room_north', x: 0, z: spacing },
            { id: 'room_south', x: 0, z: -spacing },
            { id: 'room_east', x: spacing, z: 0 },
            { id: 'room_west', x: -spacing, z: 0 }
        ];
        
        roomConfigs.forEach(config => {
            const sizeX = this.randomBetween(8, 12);
            const sizeZ = this.randomBetween(8, 12);
            
            const room = new Room(config.id, sizeX, sizeZ, config.x, config.z);
            this.rooms.set(config.id, room);
            this.roomManager.addRoom(room);
            
            // Conecta com a sala central
            this.connectRooms('center', config.id);
        });
        
        console.log('Dungeon em cruz gerada');
        
        // Ativa a sala central
        this.roomManager.switchToRoom('center', []);
        
        return {
            rooms: this.rooms,
            connections: this.connections
        };
    }
}