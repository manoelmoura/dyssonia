import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js"
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

export class Door {
    constructor(id, sizeX, sizeY, sizeZ, color = 0x472827) {
        this.id = id;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.color = color;
        
        // Cria um grupo para conter o modelo 3D
        this.mesh = new THREE.Group();
        
        // Cria uma caixa temporária como fallback
        this.createFallbackMesh();
        
        // Carrega o modelo 3D
        this.loadModel();
    }

    createFallbackMesh() {
        this.fallbackMesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.sizeX, this.sizeY, this.sizeZ),
            new THREE.MeshLambertMaterial({ color: this.color })
        );
        this.fallbackMesh.castShadow = true;
        this.fallbackMesh.receiveShadow = true;
        this.mesh.add(this.fallbackMesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        loader.load(
            'models/woodenDoor.gltf', // Caminho para o modelo
            (gltf) => {
                console.log(`Modelo da porta '${this.id}' carregado com sucesso`);
                
                // Remove o mesh temporário
                if (this.fallbackMesh) {
                    this.mesh.remove(this.fallbackMesh);
                    this.fallbackMesh = null;
                }
                
                // Configura o modelo 3D
                this.model3D = gltf.scene;
                this.setupModel3D();
                
                // Adiciona ao grupo principal
                this.mesh.add(this.model3D);
            },
            (progress) => {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                console.log(`Carregando porta '${this.id}': ${percent}%`);
            },
            (error) => {
                console.error(`Erro ao carregar modelo da porta '${this.id}':`, error);
                console.warn('Usando mesh de fallback (caixa simples)');
            }
        );
    }

    setupModel3D() {
        if (!this.model3D) return;
        
        // Configura sombras para todos os meshes do modelo
        this.model3D.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Calcula o tamanho atual do modelo
        const box = new THREE.Box3().setFromObject(this.model3D);
        const modelSize = box.getSize(new THREE.Vector3());
        
        // Calcula a escala necessária para atingir o tamanho desejado
        const scaleX = this.sizeX / modelSize.x;
        const scaleY = this.sizeY / modelSize.y;
        const scaleZ = this.sizeZ / modelSize.z;
        
        // Usa escala uniforme (menor valor para manter proporções)
        // ou escala não-uniforme se quiser forçar o tamanho exato
        const useUniformScale = true; // Mude para false se quiser escala não-uniforme
        
        if (useUniformScale) {
            const uniformScale = Math.min(scaleX, scaleY, scaleZ);
            this.model3D.scale.setScalar(uniformScale);
        } else {
            this.model3D.scale.set(scaleX, scaleY, scaleZ);
        }
        
        // Centraliza o modelo no pivot
        const center = box.getCenter(new THREE.Vector3());
        this.model3D.position.sub(center);
        
        console.log(`Porta '${this.id}' configurada - Escala: ${this.model3D.scale.x.toFixed(2)}`);
    }

    setPosition(pos) {
        this.mesh.position.set(pos.x, pos.y, pos.z);
    }

    setRotation(rotation) {
        this.mesh.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
    }

    getMesh() {
        return this.mesh;
    }

    // Método para abrir/fechar a porta (animação simples)
    openDoor(angle = Math.PI / 2, duration = 1000) {
        if (!this.model3D) {
            console.warn('Modelo 3D não carregado, não é possível abrir a porta');
            return;
        }
        
        const startRotation = this.model3D.rotation.y;
        const targetRotation = startRotation + angle;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Função de easing suave
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.model3D.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    closeDoor(duration = 1000) {
        if (!this.model3D) {
            console.warn('Modelo 3D não carregado, não é possível fechar a porta');
            return;
        }
        
        const startRotation = this.model3D.rotation.y;
        const targetRotation = 0;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Função de easing suave
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.model3D.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Verifica se o modelo 3D foi carregado
    isModelLoaded() {
        return this.model3D !== null && this.model3D !== undefined;
    }

    // Obtém informações sobre o modelo
    getModelInfo() {
        if (!this.model3D) {
            return {
                loaded: false,
                usingFallback: true
            };
        }
        
        const box = new THREE.Box3().setFromObject(this.model3D);
        const size = box.getSize(new THREE.Vector3());
        
        return {
            loaded: true,
            usingFallback: false,
            actualSize: {
                x: size.x,
                y: size.y,
                z: size.z
            },
            scale: {
                x: this.model3D.scale.x,
                y: this.model3D.scale.y,
                z: this.model3D.scale.z
            }
        };
    }
}