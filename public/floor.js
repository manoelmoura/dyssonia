import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js"
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
export class Floor {
    constructor(id, sizeX, sizeY, sizeZ, color = 0x808080) {
        this.id = id;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sizeX, sizeY, sizeZ),
            new THREE.MeshLambertMaterial({color})
        );
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = true;
    }

    setPosition(pos) {
        this.mesh.position.set(pos.x, pos.y, pos.z);
    }

    getMesh() {
        return this.mesh;
    }
}