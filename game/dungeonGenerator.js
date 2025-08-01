import { Room } from './room.js';
import { Door } from './door.js';

export class DungeonGenerator {
    constructor(roomManager) {
        this.roomManager = roomManager;
        this.rooms = new Map();
        this.connections = [];
    }

    generateDungeon(numRooms = 5) {
        this.rooms.clear();
        this.connections = [];
        
        // Gera as salas
        for (let i = 0; i < numRooms; i++) {
            const roomId = `room_${i}`;
            const sizeX = this.randomBetween(8, 16);
            const sizeZ = this.randomBetween(8, 16);
            
            const room = new Room(roomId, sizeX, sizeZ);
            this.rooms.set(roomId, room);
            this.roomManager.addRoom(room);
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
            this.roomManager.switchToRoom(roomIds[0]);
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
        
        // Escolhe uma parede aleatória para a primeira porta
        const wallOptions = ['north', 'south', 'east', 'west'];
        const door1Wall = wallOptions[Math.floor(Math.random() * wallOptions.length)];

        // Cria porta na sala 1
        const door1Position = this.getDoorPositionOnWall(room1, door1Wall);
        const door1 = new Door(
            door1Id,
            door1Position.x,
            door1Position.y,
            door1Position.z,
            roomId2,
            door2Id
        );
        room1.addObject(door1);

        // Porta da sala 2 fica na parede oposta
        const door2Wall = this.getOppositeWall(door1Wall);
        const door2Position = this.getDoorPositionOnWall(room2, door2Wall);
        const door2 = new Door(
            door2Id,
            door2Position.x,
            door2Position.y,
            door2Position.z,
            roomId1,
            door1Id
        );
        room2.addObject(door2);
        
        // Registra a conexão
        this.connections.push({
            room1: roomId1,
            room2: roomId2,
            door1: door1Id,
            door2: door2Id
        });
        
        console.log(`Conectadas salas ${roomId1} e ${roomId2}`);
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
        
        return { x, y: doorHeight, z };
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
            
            const room = new Room(roomId, sizeX, sizeZ);
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
            this.roomManager.switchToRoom('linear_room_0');
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
        
        // Sala central
        const centralRoom = new Room('center', 12, 12);
        this.rooms.set('center', centralRoom);
        this.roomManager.addRoom(centralRoom);
        
        // 4 salas ao redor
        const directions = ['north', 'south', 'east', 'west'];
        directions.forEach(dir => {
            const roomId = `room_${dir}`;
            const sizeX = this.randomBetween(8, 12);
            const sizeZ = this.randomBetween(8, 12);
            
            const room = new Room(roomId, sizeX, sizeZ);
            this.rooms.set(roomId, room);
            this.roomManager.addRoom(room);
            
            // Conecta com a sala central
            this.connectRooms('center', roomId);
        });
        
        console.log('Dungeon em cruz gerada');
        
        // Ativa a sala central
        this.roomManager.switchToRoom('center');
        
        return {
            rooms: this.rooms,
            connections: this.connections
        };
    }
}