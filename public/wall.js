import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js"
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
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