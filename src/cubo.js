import * as THREE from 'three';
import { update } from 'three/examples/jsm/libs/tween.module.js';

export class Cubo {
    constructor(color = 0xffffff, position = { x: 0, y: 0, z: 0 }) {
        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);

    }

    update() {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
    }
}