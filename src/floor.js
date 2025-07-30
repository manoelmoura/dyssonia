import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Floor {
    constructor(size = 100, color = 0x808080) {
        this.geometry = new THREE.PlaneGeometry(size, size);
        this.material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = -2;
        this.mesh.mass = 1000;

        // Colisão: criar a bounding box
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    checkCollision(object) {
        const objectBox = new THREE.Box3().setFromObject(object);
        return this.boundingBox.intersectsBox(objectBox);
    }
}
