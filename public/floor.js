import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class Floor {
    constructor(id, size, color = 0x808080) {
        this.id = id;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size,1,size),
            new THREE.MeshBasicMaterial({color})
        );
    }

    setPosition(pos) {
        this.mesh.position.set(pos.x, pos.y, pos.z);
    }

    getMesh() {
        return this.mesh;
    }
}