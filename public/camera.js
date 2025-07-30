import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

export class Camera {
    constructor(target) {
        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = 20;

        this.camera = new THREE.OrthographicCamera(
            -aspect * viewSize / 2,
            aspect * viewSize / 2,
            viewSize / 2,
            -viewSize / 2,
            0.1,
            1000
        );

        this.offset = new THREE.Vector3(10,15,10);
        this.camera.position.copy(this.offset);
        this.camera.lookAt(0,0,0);
        this.target = target;
    }

    update() {
        if (this.target) {
            const pos = this.target.position;
            this.camera.position.set(
                pos.x + this.offset.x,
                pos.y + this.offset.y,
                pos.z + this.offset.z
            );
        }
    }

    getCamera() {
        return this.camera;
    }
}