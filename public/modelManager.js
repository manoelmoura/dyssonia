import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';

class ModelManager {
    constructor() {
        this.loader = new GLTFLoader();
        this.models = new Map();
        this.loadingPromises = new Map();
        this.loadedCallbacks = new Map();
    }

    // Define todos os modelos que devem ser carregados
    getModelPaths() {
        return {
            'stones': 'stones.gltf',
            // Adicione mais modelos aqui conforme necessário
            // 'tree': 'models/tree.gltf',
            // 'house': 'models/house.gltf',
            // 'weapon': 'models/sword.gltf'
        };
    }

    // Carrega todos os modelos definidos
    async loadAllModels() {
        const modelPaths = this.getModelPaths();
        const loadPromises = [];

        console.log('Iniciando carregamento de modelos 3D...');

        for (const [name, path] of Object.entries(modelPaths)) {
            loadPromises.push(this.loadModel(name, path));
        }

        try {
            await Promise.all(loadPromises);
            console.log('Todos os modelos 3D foram carregados com sucesso!');
            return true;
        } catch (error) {
            console.warn('Alguns modelos falharam ao carregar:', error);
            return false;
        }
    }

    // Carrega um modelo específico
    loadModel(name, path) {
        // Se já está carregando, retorna a promise existente
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        // Se já foi carregado, retorna promise resolvida
        if (this.models.has(name)) {
            return Promise.resolve(this.models.get(name));
        }

        const promise = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    console.log(`Modelo '${name}' carregado:`, path);
                    
                    // Configura o modelo para sombras
                    this.setupModelShadows(gltf.scene);
                    
                    // Armazena o modelo
                    this.models.set(name, gltf);
                    
                    // Chama callbacks se houver
                    if (this.loadedCallbacks.has(name)) {
                        this.loadedCallbacks.get(name).forEach(callback => {
                            callback(gltf);
                        });
                        this.loadedCallbacks.delete(name);
                    }
                    
                    resolve(gltf);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`Carregando '${name}': ${percent}%`);
                },
                (error) => {
                    console.error(`Erro ao carregar modelo '${name}':`, error);
                    this.loadingPromises.delete(name);
                    reject(error);
                }
            );
        });

        this.loadingPromises.set(name, promise);
        return promise;
    }

    // Configura sombras para todos os meshes do modelo
    setupModelShadows(scene) {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    // Obtém um clone do modelo (para usar múltiplas instâncias)
    getModel(name) {
        const modelData = this.models.get(name);
        if (modelData) {
            return modelData.scene.clone();
        }
        return null;
    }

    // Verifica se um modelo está carregado
    isModelLoaded(name) {
        return this.models.has(name);
    }

    // Obtém o modelo original (sem clone) - útil para inspecionar
    getOriginalModel(name) {
        const modelData = this.models.get(name);
        return modelData ? modelData.scene : null;
    }

    // Registra callback para quando um modelo for carregado
    onModelLoaded(name, callback) {
        if (this.isModelLoaded(name)) {
            // Se já está carregado, chama imediatamente
            callback(this.models.get(name));
        } else {
            // Senão, registra para chamar quando carregar
            if (!this.loadedCallbacks.has(name)) {
                this.loadedCallbacks.set(name, []);
            }
            this.loadedCallbacks.get(name).push(callback);
        }
    }

    // Cria um mesh com escala adequada
    createScaledModel(name, targetSizeX, targetSizeY, targetSizeZ) {
        const model = this.getModel(name);
        if (!model) {
            console.warn(`Modelo '${name}' não encontrado!`);
            return null;
        }

        // Calcula escala baseada no tamanho desejado
        const box = new THREE.Box3().setFromObject(model);
        const modelSize = box.getSize(new THREE.Vector3());
        
        const scaleX = targetSizeX / modelSize.x;
        const scaleY = targetSizeY / modelSize.y;
        const scaleZ = targetSizeZ / modelSize.z;
        
        // Usa escala uniforme (menor valor para manter proporções)
        const uniformScale = Math.min(scaleX, scaleY, scaleZ);
        model.scale.setScalar(uniformScale);

        return model;
    }

    // Obtém informações sobre um modelo
    getModelInfo(name) {
        const model = this.getOriginalModel(name);
        if (!model) return null;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        return {
            name,
            size: { x: size.x, y: size.y, z: size.z },
            center: { x: center.x, y: center.y, z: center.z },
            loaded: true
        };
    }

    // Lista todos os modelos e seus status
    listModels() {
        const modelPaths = this.getModelPaths();
        const status = {};

        for (const name of Object.keys(modelPaths)) {
            status[name] = {
                loaded: this.isModelLoaded(name),
                loading: this.loadingPromises.has(name),
                info: this.isModelLoaded(name) ? this.getModelInfo(name) : null
            };
        }

        return status;
    }
}

// Cria instância global
const modelManager = new ModelManager();

// Exporta tanto a classe quanto a instância
export default modelManager;
export { ModelManager };