import * as THREE from 'three';

export class Camera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            90,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
    }

    getCamera() {
        return this.camera;
    }
}