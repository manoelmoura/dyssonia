export class GravitySystem {
    constructor(gravity = -9.8) {
        this.gravity = gravity; // Força da gravidade (negativa para puxar para baixo)
        this.objects = []; // Lista de objetos afetados pela gravidade
    }

    // Adiciona um objeto ao sistema de gravidade
    addObject(object) {
        if (!this.objects.includes(object)) {
            this.objects.push(object);
        }
    }

    // Remove um objeto do sistema de gravidade
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    // Aplica gravidade a todos os objetos registrados
    update(deltaTime) {
        for (const object of this.objects) {
            // Aplica a força da gravidade na velocidade Y
            object.velocity.y += this.gravity * deltaTime;
        }
    }

    // Faz um objeto "pular" (adiciona velocidade para cima)
    makeObjectJump(object, jumpForce = 5) {
        object.velocity.y = jumpForce;
    }

    // Define uma nova força de gravidade
    setGravity(newGravity) {
        this.gravity = newGravity;
    }

    // Limpa todos os objetos
    clear() {
        this.objects = [];
    }
}