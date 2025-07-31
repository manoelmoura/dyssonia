import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class Player {
    constructor(id, sizeX, sizeY, sizeZ, color = 0x00ff00) {
        this.id = id;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sizeX, sizeY, sizeZ),
            new THREE.MeshLambertMaterial({color})
        );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Adiciona a sombra circular
        this.createShadow();
    }

    createShadow() {
        const shadowGeometry = new THREE.CircleGeometry(0.8, 16);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        });
        
        this.shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowMesh.rotation.x = -Math.PI / 2; // Rotaciona para ficar horizontal
        this.shadowMesh.position.y = 0.01; // Ligeiramente acima do chão
        
        console.log('Sombra criada para player:', this.id); // Debug
    }

    setPosition(pos) {
        this.mesh.position.set(pos.x, pos.y, pos.z);
        
        // Atualiza posição da sombra projetada
        if (this.shadowMesh) {
            const groundY = this.findGroundBelow(pos);
            this.shadowMesh.position.set(pos.x, groundY + 0.01, pos.z);
            
            // Ajusta opacidade baseada na distância do chão
            const distanceToGround = Math.max(0, pos.y - groundY);
            const maxDistance = 10;
            const opacity = Math.max(0.1, 0.6 - (distanceToGround / maxDistance) * 0.5);
            this.shadowMesh.material.opacity = opacity;
        }
    }

    getMesh() {
        return this.mesh;
    }

    getShadowMesh() {
        console.log('getShadowMesh chamado, retornando:', this.shadowMesh); // Debug
        return this.shadowMesh;
    }

    findGroundBelow(playerPos) {
        // Acessa os objetos do mundo através da cena global
        // Como não temos acesso direto aos gameObjects aqui, vamos usar raycasting
        
        const raycaster = new THREE.Raycaster();
        const origin = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);
        const direction = new THREE.Vector3(0, -1, 0); // Para baixo
        
        raycaster.set(origin, direction);
        
        // Pega todos os objetos da cena que podem receber sombra
        const intersectable = [];
        
        // Procura objetos na cena global (precisa acessar de fora)
        if (window.gameScene) {
            window.gameScene.traverse((child) => {
                if (child.isMesh && child !== this.mesh && child !== this.shadowMesh) {
                    // Só considera objetos que podem servir de chão
                    if (child.material && (child.material.receiveShadow !== false)) {
                        intersectable.push(child);
                    }
                }
            });
        }
        
        const intersects = raycaster.intersectObjects(intersectable);
        
        if (intersects.length > 0) {
            // Retorna a posição Y do primeiro objeto atingido
            return intersects[0].point.y;
        }
        
        // Se não encontrou nada, assume Y = 0 (chão padrão)
        return 0;
    }
}