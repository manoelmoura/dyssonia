import * as THREE from 'three';

export class Camera {
    constructor() {
        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = 20; // Size of the view in world units

        this.camera = new THREE.OrthographicCamera(
            -aspect * viewSize / 2,
            aspect * viewSize / 2,
            viewSize / 2,
            -viewSize / 2,
            0.1,
            1000
        );
    }

    getCamera() {
        return this.camera;
    }
}