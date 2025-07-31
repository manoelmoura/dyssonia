export class CollisionSystem {
    constructor() {
        // Lista de objetos que podem colidir
        this.collidableObjects = [];
    }

    // Adiciona um objeto à lista de colisões
    addObject(object) {
        if (!this.collidableObjects.includes(object)) {
            this.collidableObjects.push(object);
        }
    }

    // Remove um objeto da lista de colisões
    removeObject(object) {
        const index = this.collidableObjects.indexOf(object);
        if (index > -1) {
            this.collidableObjects.splice(index, 1);
        }
    }

    // Verifica colisão AABB entre dois objetos
    checkAABBCollision(obj1, obj2) {
        const halfSizeX1 = obj1.sizeX / 2;
        const halfSizeY1 = obj1.sizeY / 2;
        const halfSizeZ1 = obj1.sizeZ / 2;
        
        const halfSizeX2 = obj2.sizeX / 2;
        const halfSizeY2 = obj2.sizeY / 2;
        const halfSizeZ2 = obj2.sizeZ / 2;

        // Calcula os limites de cada objeto no eixo X
        const obj1Left = obj1.position.x - halfSizeX1;
        const obj1Right = obj1.position.x + halfSizeX1;
        const obj2Left = obj2.position.x - halfSizeX2;
        const obj2Right = obj2.position.x + halfSizeX2;

        // Calcula os limites de cada objeto no eixo Y
        const obj1YTop = obj1.position.y + halfSizeY1;
        const obj1YBottom = obj1.position.y - halfSizeY1;
        const obj2YTop = obj2.position.y + halfSizeY2;
        const obj2YBottom = obj2.position.y - halfSizeY2;

        // Calcula os limites de cada objeto no eixo Z
        const obj1ZFront = obj1.position.z - halfSizeZ1;
        const obj1ZBack = obj1.position.z + halfSizeZ1;
        const obj2ZFront = obj2.position.z - halfSizeZ2;
        const obj2ZBack = obj2.position.z + halfSizeZ2;

        // Verifica se há sobreposição nos três eixos
        const overlapX = obj1Right > obj2Left && obj1Left < obj2Right;
        const overlapY = obj1YTop > obj2YBottom && obj1YBottom < obj2YTop;
        const overlapZ = obj1ZBack > obj2ZFront && obj1ZFront < obj2ZBack;

        return overlapX && overlapY && overlapZ;
    }

    // Resolve colisão baseada na massa dos objetos
    resolveCollision(obj1, obj2) {
        const mass1 = obj1.mass;
        const mass2 = obj2.mass;
        
        const halfSizeX1 = obj1.sizeX / 2;
        const halfSizeY1 = obj1.sizeY / 2;
        const halfSizeZ1 = obj1.sizeZ / 2;
        
        const halfSizeX2 = obj2.sizeX / 2;
        const halfSizeY2 = obj2.sizeY / 2;
        const halfSizeZ2 = obj2.sizeZ / 2;

        // Calcula a distância entre os centros
        const deltaX = obj2.position.x - obj1.position.x;
        const deltaY = obj2.position.y - obj1.position.y;
        const deltaZ = obj2.position.z - obj1.position.z;

        // Calcula a sobreposição em cada eixo
        const overlapX = (halfSizeX1 + halfSizeX2) - Math.abs(deltaX);
        const overlapY = (halfSizeY1 + halfSizeY2) - Math.abs(deltaY);
        const overlapZ = (halfSizeZ1 + halfSizeZ2) - Math.abs(deltaZ);

        // Resolve na direção com menor sobreposição
        if (overlapX <= overlapY && overlapX <= overlapZ) {
            // Resolve no eixo X
            const direction = deltaX > 0 ? 1 : -1;
            this.resolveMassBasedSeparation(obj1, obj2, mass1, mass2, 'x', direction, overlapX);
            
        } else if (overlapY <= overlapX && overlapY <= overlapZ) {
            // Resolve no eixo Y
            const direction = deltaY > 0 ? 1 : -1;
            this.resolveMassBasedSeparation(obj1, obj2, mass1, mass2, 'y', direction, overlapY);
            
            // Para colisões no eixo Y, zera a velocidade vertical dos objetos
            if (mass1 < mass2) {
                obj1.velocity.y = 0;
            } else if (mass2 < mass1) {
                obj2.velocity.y = 0;
            } else {
                obj1.velocity.y = 0;
                obj2.velocity.y = 0;
            }
            
        } else {
            // Resolve no eixo Z
            const direction = deltaZ > 0 ? 1 : -1;
            this.resolveMassBasedSeparation(obj1, obj2, mass1, mass2, 'z', direction, overlapZ);
        }
    }

    // Resolve a separação baseada na massa
    resolveMassBasedSeparation(obj1, obj2, mass1, mass2, axis, direction, overlap) {
        if (mass1 === Infinity && mass2 === Infinity) {
            // Ambos são imóveis - não resolve
            return;
        } else if (mass1 === Infinity) {
            // obj1 é imóvel (como o chão), move apenas obj2
            obj2.position[axis] += direction * overlap;
            obj2.velocity[axis] = 0;
        } else if (mass2 === Infinity) {
            // obj2 é imóvel (como o chão), move apenas obj1
            obj1.position[axis] -= direction * overlap;
            obj1.velocity[axis] = 0;
        } else if (mass1 > mass2) {
            // obj1 é mais pesado, empurra obj2
            obj2.position[axis] += direction * overlap;
            obj2.velocity[axis] = 0;
        } else if (mass2 > mass1) {
            // obj2 é mais pesado, empurra obj1
            obj1.position[axis] -= direction * overlap;
            obj1.velocity[axis] = 0;
        } else {
            // Massas iguais - ambos se empurram mutuamente
            const separation = overlap / 2;
            obj1.position[axis] -= direction * separation;
            obj2.position[axis] += direction * separation;
            obj1.velocity[axis] = 0;
            obj2.velocity[axis] = 0;
        }
    }

    // Verifica colisões entre todos os objetos
    checkAllCollisions() {
        const collisions = [];
        
        for (let i = 0; i < this.collidableObjects.length; i++) {
            for (let j = i + 1; j < this.collidableObjects.length; j++) {
                const obj1 = this.collidableObjects[i];
                const obj2 = this.collidableObjects[j];
                
                if (this.checkAABBCollision(obj1, obj2)) {
                    collisions.push({ obj1, obj2 });
                }
            }
        }
        
        return collisions;
    }

    // Verifica se um objeto específico está colidindo com algo
    getCollisionsFor(targetObject) {
        const collisions = [];
        
        for (const obj of this.collidableObjects) {
            if (obj !== targetObject && this.checkAABBCollision(targetObject, obj)) {
                collisions.push(obj);
            }
        }
        
        return collisions;
    }

    // Método específico para verificar se um objeto está no chão
    isObjectGrounded(targetObject, groundCheckDistance = 0.1) {
        // Cria uma versão de teste do objeto ligeiramente abaixo
        const testObject = {
            ...targetObject,
            position: {
                x: targetObject.position.x,
                y: targetObject.position.y - groundCheckDistance,
                z: targetObject.position.z
            }
        };

        for (const obj of this.collidableObjects) {
            if (obj.id === targetObject.id) continue;
            
            if (this.checkAABBCollision(testObject, obj)) {
                // Verifica se o objeto está realmente abaixo
                const targetBottom = targetObject.position.y - (targetObject.sizeY / 2);
                const objTop = obj.position.y + (obj.sizeY / 2);
                
                if (objTop <= targetBottom + groundCheckDistance) {
                    return true;
                }
            }
        }
        
        return false;
    }

    update() {
        // Resolve colisões múltiplas vezes para lidar com colisões em cadeia
        let iterations = 0;
        const maxIterations = 5; // Evita loop infinito
        
        while (iterations < maxIterations) {
            const collisions = this.checkAllCollisions();
            
            if (collisions.length === 0) {
                break; // Não há mais colisões para resolver
            }
            
            // Resolve todas as colisões encontradas
            collisions.forEach(collision => {
                this.resolveCollision(collision.obj1, collision.obj2);
            });
            
            iterations++;
        }
        
        return this.checkAllCollisions(); // Retorna colisões finais
    }

    // Limpa todos os objetos
    clear() {
        this.collidableObjects = [];
    }
}