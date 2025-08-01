import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class Box {
    constructor(id, sizeX, sizeY, sizeZ, color = 0x472827) {
        this.id = id;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sizeX,sizeY,sizeZ),
            new THREE.MeshLambertMaterial({color})
        );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    setPosition(pos) {
        this.mesh.position.set(pos.x, pos.y, pos.z);
    }

    getMesh() {
        return this.mesh;
    }
}