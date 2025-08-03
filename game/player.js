import { GameObject } from './gameObject.js';

export class Player extends GameObject {
    constructor(id, username) {
        super(id, "player");
        this.username = username;
        this.hp = 100;
        this.speed = 10;
        this.sizeX = 1;
        this.sizeY = 1;
        this.sizeZ = 1;

        this.position.y = 3;
        this.groundCheckDistance = 0.1; // Distância para verificar se está no chão
    }

    jump(jumpForce = 8) {
        this.velocity.y = jumpForce;
    }

    handleInput(input, collisionSystem, gravitySystem) {
        this.velocity.x = (input.x || 0) * this.speed;
        this.velocity.z = (input.z || 0) * this.speed;
        
        if (input.jump && this.isGrounded(collisionSystem)) {
            this.jump();
        }
    }

    isGrounded(collisionSystem) {
        // Cria uma versão temporária do player ligeiramente abaixo para testar colisão
        const testPlayer = {
            id: this.id + '_ground_test',
            type: 'player',
            position: {
                x: this.position.x,
                y: this.position.y - this.groundCheckDistance, // Verifica um pouco abaixo
                z: this.position.z
            },
            sizeX: this.sizeX,
            sizeY: this.sizeY,
            sizeZ: this.sizeZ
        };

        // Verifica colisão com todos os objetos colidíveis
        for (const obj of collisionSystem.collidableObjects) {
            if (obj.id === this.id) continue; // Ignora o próprio player
            
            // Verifica se há colisão com o player de teste
            if (collisionSystem.checkAABBCollision(testPlayer, obj)) {
                // Verifica se o objeto está abaixo do player (é realmente chão)
                const playerBottom = this.position.y - (this.sizeY / 2);
                const objTop = obj.position.y + (obj.sizeY / 2);
                
                // Se o topo do objeto está próximo ou abaixo da base do player
                if (objTop <= playerBottom + this.groundCheckDistance) {
                    return true;
                }
            }
        }
        
        return false;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}