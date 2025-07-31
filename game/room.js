import { Floor } from './floor.js';
import { Box } from './box.js';

export class Room {
    constructor(id, x = 0, z = 0) {
        this.id = id;
        this.centerX = x;
        this.centerZ = z;
        
        // Tamanho aleatório da sala (2 a 40)
        this.width = this.randomBetween(2, 40);
        this.depth = this.randomBetween(2, 40);
        this.height = 1; // Altura do piso
        
        this.objects = [];
        this.generateRoom();
    }
    
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    generateRoom() {
        // Cria o piso da sala
        this.createFloor();
        
        // Gera 5 caixas em posições aleatórias
        this.generateBoxes(5);
    }
    
    createFloor() {
        const floorId = `${this.id}_floor`;
        const floor = new Floor(
            floorId,
            this.centerX,
            -this.height / 2, // Posição Y (centro do piso)
            this.centerZ,
            this.width,
            this.height,
            this.depth
        );
        
        this.objects.push(floor);
    }
    
    generateBoxes(count) {
        for (let i = 0; i < count; i++) {
            // Posição aleatória dentro da sala (com margem nas bordas)
            const margin = 2; // Margem das bordas
            const maxX = (this.width / 2) - margin;
            const maxZ = (this.depth / 2) - margin;
            
            const x = this.centerX + this.randomBetween(-maxX, maxX);
            const z = this.centerZ + this.randomBetween(-maxZ, maxZ);
            
            // Tamanho aleatório da caixa
            const sizeX = this.randomBetween(1, 3);
            const sizeY = this.randomBetween(1, 4);
            const sizeZ = this.randomBetween(1, 3);
            
            // Posição Y no topo do piso
            const y = (this.height / 2) + (sizeY / 2);
            
            // Massa aleatória
            const mass = Math.random() * 0.8 + 0.2; // Entre 0.2 e 1.0
            
            const boxId = `${this.id}_box_${i}`;
            const box = new Box(boxId, x, y, z, sizeX, sizeY, sizeZ, mass);
            
            this.objects.push(box);
        }
    }
    
    // Retorna todos os objetos da sala
    getObjects() {
        return this.objects;
    }
    
    // Verifica se um ponto está dentro da sala
    isPointInside(x, z) {
        const halfWidth = this.width / 2;
        const halfDepth = this.depth / 2;
        
        return (x >= this.centerX - halfWidth && x <= this.centerX + halfWidth &&
                z >= this.centerZ - halfDepth && z <= this.centerZ + halfDepth);
    }
    
    // Retorna informações da sala
    getInfo() {
        return {
            id: this.id,
            centerX: this.centerX,
            centerZ: this.centerZ,
            width: this.width,
            depth: this.depth,
            objectCount: this.objects.length
        };
    }
}