export class World {
    constructor() {
        this.objects = new Map();
    }

    addObject(object) {
        this.objects.set(object.id, object);
    }

    removeObject(id) {
        this.objects.delete(id);
    }

    getObject(id) {
        return this.objects.get(id);
    }

    update(deltaTime) {
        //console.log('World updating, objects count:', this.objects.size);
        for (const obj of this.objects.values()) {
            //console.log('Updating object:', obj.id, 'velocity:', obj.velocity);
            obj.update(deltaTime);
            //console.log('New position:', obj.position);
        }
    }

    getState() {
        const state = [];
        for (const obj of this.objects.values()) {
            state.push({
                id: obj.id,
                type: obj.type,
                position: obj.position,
                rotation: obj.rotation,
                sizeX: obj.sizeX,
                sizeY: obj.sizeY,
                sizeZ: obj.sizeZ
            });
        }
        return state;
    }

    getStateNearPosition(centerX, centerZ, radius) {
        const state = [];
        for (const obj of this.objects.values()) {
            const distance = Math.sqrt(
                Math.pow(obj.position.x - centerX, 2) + 
                Math.pow(obj.position.z - centerZ, 2)
            );
            
            if (distance <= radius) {
                state.push({
                    id: obj.id,
                    type: obj.type,
                    position: obj.position,
                    rotation: obj.rotation,
                    sizeX: obj.sizeX,
                    sizeY: obj.sizeY,
                    sizeZ: obj.sizeZ
                });
            }
        }
        return state;
    }
}