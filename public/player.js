import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class Player {
    constructor(id, sizeX, sizeY, sizeZ, color = 0x00ff00) {
        this.id = id;
        
        // Cria um grupo para conter os dois cubos
        this.mesh = new THREE.Group();
        
        // Cubo das pernas (1x1x1)
        this.legsMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({color: color})
        );
        this.legsMesh.position.y = 0.5; // Centro do cubo das pernas (base em y=0, topo em y=1)
        this.legsMesh.castShadow = true;
        this.legsMesh.receiveShadow = true;
        
        // Cubo do torso (1x1x1)
        this.torsoMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({color: color})
        );
        this.torsoMesh.position.y = 1.5; // Centro do cubo do torso (base em y=1, topo em y=2)
        this.torsoMesh.castShadow = true;
        this.torsoMesh.receiveShadow = true;
        
        // Adiciona os cubos ao grupo
        this.mesh.add(this.legsMesh);
        this.mesh.add(this.torsoMesh);
        
        // Adiciona a sombra circular
        this.createShadow();
    }

    // Métodos para acessar partes específicas (para futuros modelos 3D)
    getLegsMesh() {
        return this.legsMesh;
    }

    getTorsoMesh() {
        return this.torsoMesh;
    }

    // Método para rotacionar o torso
    setTorsoRotation(rotationY) {
        this.torsoMesh.rotation.y = rotationY;
    }

    createShadow() {
        const shadowGeometry = new THREE.CircleGeometry(0.6, 16);
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
        
        // Atualiza posição da sombra projetada baseada nas pernas
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
        const raycaster = new THREE.Raycaster();
        
        // Use a posição das pernas em vez da posição geral do player
        const legsWorldPos = new THREE.Vector3();
        this.legsMesh.getWorldPosition(legsWorldPos);
        
        const origin = new THREE.Vector3(legsWorldPos.x, legsWorldPos.y, legsWorldPos.z);
        const direction = new THREE.Vector3(0, -1, 0); // Para baixo
        
        raycaster.set(origin, direction);
        
        // Pega todos os objetos da cena que podem receber sombra
        const intersectable = [];
        
        // Procura objetos na cena global (precisa acessar de fora)
        if (window.gameScene) {
            window.gameScene.traverse((child) => {
                if (child.isMesh && child !== this.legsMesh && child !== this.torsoMesh && child !== this.shadowMesh) {
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