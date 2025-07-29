import * as THREE from 'three';

export class Floor {
    constructor(size = 100, color = 0x808080) {
        this.geometry = new THREE.PlaneGeometry(size, size);
        this.material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = -2;

        this.boundingBox = new THREE.Box3().set
    }
    
    colision() {
        this.boundingBox.setFromObject(this.mesh);
    };
}