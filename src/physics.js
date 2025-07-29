// physics.js
import * as THREE from 'three';

const GRAVITY = -0.02;

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
                // Resolver colisão simples no eixo Y (vertical)
                if (a.position.y > b.position.y) {
                    a.position.y = b.position.y + getObjectHeight(b) / 2 + getObjectHeight(a) / 2;
                    if (a.velocity) a.velocity.y = 0;
                } else {
                    b.position.y = a.position.y + getObjectHeight(a) / 2 + getObjectHeight(b) / 2;
                    if (b.velocity) b.velocity.y = 0;
                }
            }
        }
    }
}

function getObjectHeight(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    return box.max.y - box.min.y;
}
