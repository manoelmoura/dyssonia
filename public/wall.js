import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class Wall {
    constructor(id, sizeX, sizeY, sizeZ, color = 0x888888) {
        this.id = id;
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(sizeX, sizeY),
            new THREE.MeshLambertMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0
            })
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