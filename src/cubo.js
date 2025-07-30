import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Cubo {
    constructor(color = 0xffffff, position = { x: 0, y: 0, z: 0 }) {
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.mass = 1;

    }

    update() {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
    }
}