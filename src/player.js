import * as THREE from 'three';

export class Player {
    constructor(camera) {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 3, 0);
        this.camera = camera;

        this.mesh.mass = 10;

        this.keys = {};
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });
        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }
    move() {
        if (!this.camera) return;

        const speed = 0.1;
        const direction = new THREE.Vector3();

        this.camera.getWorldDirection(direction);
        direction.y = 0; // Prevent vertical movement
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0));

        if (this.keys['w']) {
            this.mesh.position.add(direction.clone().multiplyScalar(speed));
        }
        if (this.keys['s']) {
            this.mesh.position.sub(direction.clone().multiplyScalar(speed));
        }
        if (this.keys['a']) {
            this.mesh.position.sub(right.clone().multiplyScalar(speed));
        }
        if (this.keys['d']) {
            this.mesh.position.add(right.clone().multiplyScalar(speed));
        }
    }

    enableMouseLook() {
        window.addEventListener('mousemove', (event) => {
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;

            this.mesh.rotation.y -= movementX * 0.001; // Adjust sensitivity as needed
            this.mesh.rotation.x -= movementY * 0.001; // Adjust sensitivity as needed

            const limit = Math.PI / 2;
            this.mesh.rotation.x = Math.max(-limit, Math.min(limit, this.mesh.rotation.x));
        });
    }

    updateCameraFps() {
        if (!this.camera) return;
    
        this.camera.position.copy(this.mesh.position);

        const direction = new THREE.Vector3(
            Math.sin(this.mesh.rotation.y),
            Math.sin(this.mesh.rotation.x),
            Math.cos(this.mesh.rotation.y)
        );

        const lookTarget = this.mesh.position.clone().add(direction);
        this.camera.lookAt(lookTarget);
    }

    updateCamera() {
        if (!this.camera) return;

        // Posição fixa da câmera em relação ao player
        const offset = new THREE.Vector3(-10, 10, -10); // você pode ajustar esses valores

        const cameraPos = this.mesh.position.clone().add(offset);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(this.mesh.position);    
    }
}

