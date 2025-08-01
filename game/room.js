import { Floor } from './floor.js';
import { Wall } from './wall.js';

export class Room {
    constructor(id, sizeX, sizeZ, worldX = 0, worldZ = 0) {
        this.id = id;
        this.sizeX = sizeX;
        this.sizeZ = sizeZ;
        // Posição absoluta da sala no mundo
        this.worldX = worldX;
        this.worldZ = worldZ;
        this.objects = [];
        this.isActive = false;
        // Spawn point relativo à posição da sala
        this.spawnX = 0;
        this.spawnY = 1;
        this.spawnZ = 0;
        
        this.createFloor();
        this.createWalls();
    }
    
    createFloor() {
        const floor = new Floor(
            `${this.id}_floor`,
            this.worldX + 0, // Posição absoluta
            -0.5, 
            this.worldZ + 0,
            this.sizeX, 1, this.sizeZ
        );
        this.objects.push(floor);
    }
    
    createWalls() {
        const wallHeight = 30;
        const wallThickness = 0.2;
        
        // Parede Norte (Z positivo) - posição absoluta
        const wallNorth = new Wall(
            `${this.id}_wall_north`,
            this.worldX + 0, 
            wallHeight/2, 
            this.worldZ + this.sizeZ/2,
            this.sizeX, wallHeight, wallThickness
        );
        this.objects.push(wallNorth);
        
        // Parede Sul (Z negativo) - posição absoluta
        const wallSouth = new Wall(
            `${this.id}_wall_south`,
            this.worldX + 0, 
            wallHeight/2, 
            this.worldZ - this.sizeZ/2,
            this.sizeX, wallHeight, wallThickness
        );
        this.objects.push(wallSouth);
        
        // Parede Leste (X positivo) - posição absoluta
        const wallEast = new Wall(
            `${this.id}_wall_east`,
            this.worldX + this.sizeX/2, 
            wallHeight/2, 
            this.worldZ + 0,
            wallThickness, wallHeight, this.sizeZ
        );
        this.objects.push(wallEast);
        
        // Parede Oeste (X negativo) - posição absoluta
        const wallWest = new Wall(
            `${this.id}_wall_west`,
            this.worldX - this.sizeX/2, 
            wallHeight/2, 
            this.worldZ + 0,
            wallThickness, wallHeight, this.sizeZ
        );
        this.objects.push(wallWest);
    }
    
    addObject(obj) {
        // Se o objeto é uma porta, ajusta sua posição para ser absoluta
        if (obj.type === 'door') {
            obj.position.x += this.worldX;
            obj.position.z += this.worldZ;
        }
        this.objects.push(obj);
    }
    
    activate(world, collisionSystem, gravitySystem) {
        if (!this.isActive) {
            this.objects.forEach(obj => {
                world.addObject(obj);
                collisionSystem.addObject(obj);
                
                if (obj.type === 'box') {
                    gravitySystem.addObject(obj);
                }
            });
            this.isActive = true;
            console.log(`Sala ${this.id} ativada na posição (${this.worldX}, ${this.worldZ})`);
        }
    }
    
    deactivate(world, collisionSystem, gravitySystem) {
        if (this.isActive) {
            this.objects.forEach(obj => {
                world.removeObject(obj.id);
                collisionSystem.removeObject(obj);
                gravitySystem.removeObject(obj);
            });
            this.isActive = false;
            console.log(`Sala ${this.id} desativada`);
        }
    }
    
    setSpawnPoint(x, y, z) {
        this.spawnX = x;
        this.spawnY = y;
        this.spawnZ = z;
    }
    
    getSpawnPoint() {
        return { 
            x: this.worldX + this.spawnX, // Posição absoluta
            y: this.spawnY, 
            z: this.worldZ + this.spawnZ 
        };
    }
    
    // Função para definir a posição da sala no mundo
    setWorldPosition(x, z) {
        // Calcula o offset necessário
        const offsetX = x - this.worldX;
        const offsetZ = z - this.worldZ;
        
        // Atualiza a posição da sala
        this.worldX = x;
        this.worldZ = z;
        
        // Move todos os objetos da sala
        this.objects.forEach(obj => {
            obj.position.x += offsetX;
            obj.position.z += offsetZ;
        });
    }
    
    // Verifica se um ponto está dentro desta sala
    containsPoint(x, z) {
        const minX = this.worldX - this.sizeX/2;
        const maxX = this.worldX + this.sizeX/2;
        const minZ = this.worldZ - this.sizeZ/2;
        const maxZ = this.worldZ + this.sizeZ/2;
        
        return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
    }
}