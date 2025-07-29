// physics.js
import * as THREE from 'three';

const GRAVITY = -0.01;

export function gravity(...objects) {
    objects.forEach(obj => {
        if (!obj.velocity) {
            obj.velocity = new THREE.Vector3(0, 0, 0);
        }

        // Aplica gravidade
        obj.velocity.y += GRAVITY;
        obj.position.y += obj.velocity.y;
    });
}

export function collision(...objects) {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const a = objects[i];
            const b = objects[j];

            const boxA = new THREE.Box3().setFromObject(a);
            const boxB = new THREE.Box3().setFromObject(b);

            if (boxA.intersectsBox(boxB)) {
                const centerA = boxA.getCenter(new THREE.Vector3());
                const centerB = boxB.getCenter(new THREE.Vector3());

                const sizeA = boxA.getSize(new THREE.Vector3());
                const sizeB = boxB.getSize(new THREE.Vector3());

                const dx = centerA.x - centerB.x;
                const dy = centerA.y - centerB.y;
                const dz = centerA.z - centerB.z;

                const overlapX = (sizeA.x / 2 + sizeB.x / 2) - Math.abs(dx);
                const overlapY = (sizeA.y / 2 + sizeB.y / 2) - Math.abs(dy);
                const overlapZ = (sizeA.z / 2 + sizeB.z / 2) - Math.abs(dz);

                // Empurra no eixo com menor sobreposição
                if (overlapX < overlapY && overlapX < overlapZ) {
                    const dir = dx > 0 ? 1 : -1;
                    a.position.x += (overlapX / 2) * dir;
                    b.position.x -= (overlapX / 2) * dir;

                    if (a.velocity) a.velocity.x = 0;
                    if (b.velocity) b.velocity.x = 0;
                } else if (overlapY < overlapX && overlapY < overlapZ) {
                    const dir = dy > 0 ? 1 : -1;
                    a.position.y += (overlapY / 2) * dir;
                    b.position.y -= (overlapY / 2) * dir;

                    if (a.velocity) a.velocity.y = 0;
                    if (b.velocity) b.velocity.y = 0;
                } else {
                    const dir = dz > 0 ? 1 : -1;
                    a.position.z += (overlapZ / 2) * dir;
                    b.position.z -= (overlapZ / 2) * dir;

                    if (a.velocity) a.velocity.z = 0;
                    if (b.velocity) b.velocity.z = 0;
                }
            }
        }
    }
}

