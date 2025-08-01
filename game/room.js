import { Floor } from './floor.js';

export class Room {
    constructor(id, sizeX, sizeZ) {
        this.id = id;
        this.sizeX = sizeX;
        this.sizeZ = sizeZ;
        this.objects = [];
        this.isActive = false;
        this.spawnX = 0; // Posição onde players aparecem ao entrar
        this.spawnY = 1;
        this.spawnZ = 0;
        
        this.createFloor();
    }
    
    createFloor() {
        const floor = new Floor(
            `${this.id}_floor`,
            0, -0.5, 0,
            this.sizeX, 1, this.sizeZ
        );
        this.objects.push(floor);
    }
    
    addObject(obj) {
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
            console.log(`Sala ${this.id} ativada`);
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
        return { x: this.spawnX, y: this.spawnY, z: this.spawnZ };
    }
}