import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js"
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
export class Camera {
    constructor(target) {
        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = 20;

        // Câmera ortográfica (isométrica)
        this.orthoCamera = new THREE.OrthographicCamera(
            -aspect * viewSize / 2,
            aspect * viewSize / 2,
            viewSize / 2,
            -viewSize / 2,
            0.1,
            1000
        );

        // Câmera perspectiva (primeira pessoa)
        this.perspCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

        this.offset = new THREE.Vector3(10,15,10);
        this.zoomLevel = 1.0; // Nível de zoom inicial
        this.minZoom = 0.2; // Zoom máximo (mais próximo)
        this.maxZoom = 3.0; // Zoom mínimo (mais longe)
        this.orthoCamera.position.copy(this.offset);
        this.orthoCamera.lookAt(0,0,0);
        
        this.target = target;
        this.isFirstPerson = false; // Estado da câmera
        this.currentCamera = this.orthoCamera; // Câmera ativa
        
        // Controles do mouse
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPointerLocked = false;
        
        // Configurar controles do mouse
        this.setupMouseControls();
    }

    setupMouseControls() {
        // Click para ativar pointer lock em primeira pessoa
        document.addEventListener('click', () => {
            if (this.isFirstPerson) {
                document.body.requestPointerLock();
            }
        });

        // Detectar quando pointer lock é ativado/desativado
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
        });

        // Controle do mouse
        document.addEventListener('mousemove', (e) => {
            if (this.isFirstPerson && this.isPointerLocked) {
                // Primeira pessoa: movimentos CORRIGIDOS (desinvertidos)
                this.mouseX -= e.movementX * 0.002; // Invertido: -= em vez de +=
                this.mouseY -= e.movementY * 0.002; // Invertido: -= em vez de +=
                // Limita a rotação vertical
                this.mouseY = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.mouseY));
            } else if (!this.isFirstPerson) {
                // Terceira pessoa: calcular ângulo baseado na posição do mouse
                const rect = document.body.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                
                // Calcular ângulo para o torso "olhar" para o mouse
                // Compensando o ângulo isométrico da câmera (45°)
                this.mouseRotation = Math.atan2(deltaX, deltaY) + Math.PI/4;
            }
        });

        // Controle de zoom com scroll do mouse
        document.addEventListener('wheel', (e) => {
            const zoomSpeed = 0.1;
            
            if (!this.isFirstPerson) {
                // Terceira pessoa: zoom normal
                this.zoomLevel += e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
                this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel));
                
                // Se zoom for muito próximo, muda para primeira pessoa
                if (this.zoomLevel <= this.minZoom) {
                    this.toggleCamera();
                }
            } else {
                // Primeira pessoa: scroll out volta para terceira pessoa
                if (e.deltaY > 0) { // Scroll para baixo = zoom out = volta para terceira pessoa
                    this.zoomLevel = 1.0; // Começa com zoom padrão
                    this.toggleCamera();
                }
            }
            
            e.preventDefault(); // Previne scroll da página
        });
    }

    toggleCamera() {
        this.isFirstPerson = !this.isFirstPerson;
        this.currentCamera = this.isFirstPerson ? this.perspCamera : this.orthoCamera;
        
        // Reset zoom quando muda para primeira pessoa
        if (this.isFirstPerson) {
            this.zoomLevel = 1.0;
        }
        
        // Liberar pointer lock quando sair da primeira pessoa
        if (!this.isFirstPerson && this.isPointerLocked) {
            document.exitPointerLock();
        }
        
        console.log('Câmera alternada para:', this.isFirstPerson ? 'Primeira Pessoa' : 'Terceira Pessoa');
    }

    update() {
        if (this.target) {
            const pos = this.target.position;
            
            if (this.isFirstPerson) {
                // Primeira pessoa: câmera na altura do torso (Y + 1.5)
                this.perspCamera.position.set(pos.x, pos.y + 1.5, pos.z);
                this.perspCamera.rotation.order = 'YXZ';
                this.perspCamera.rotation.y = this.mouseX;
                this.perspCamera.rotation.x = this.mouseY;
                
                // Rotaciona o torso do player na horizontal (apenas Y)
                if (window.localPlayer && window.localPlayer.setTorsoRotation) {
                    window.localPlayer.setTorsoRotation(this.mouseX);
                }
            } else {
                // Terceira pessoa isométrica com zoom
                const zoomedOffset = this.offset.clone().multiplyScalar(this.zoomLevel);
                this.orthoCamera.position.set(
                    pos.x + zoomedOffset.x,
                    pos.y + zoomedOffset.y,
                    pos.z + zoomedOffset.z
                );
                
                // Ajusta o tamanho da câmera ortográfica baseado no zoom
                const aspect = window.innerWidth / window.innerHeight;
                const viewSize = 20 * this.zoomLevel;
                this.orthoCamera.left = -aspect * viewSize / 2;
                this.orthoCamera.right = aspect * viewSize / 2;
                this.orthoCamera.top = viewSize / 2;
                this.orthoCamera.bottom = -viewSize / 2;
                this.orthoCamera.updateProjectionMatrix();
                
                // Rotaciona o torso para "olhar" na direção do mouse
                if (window.localPlayer && window.localPlayer.setTorsoRotation) {
                    window.localPlayer.setTorsoRotation(this.mouseRotation);
                }
            }
        }
    }

    getCamera() {
        return this.currentCamera;
    }

    // Retorna se está em primeira pessoa (para usar no controle de movimento)
    isFirstPersonMode() {
        return this.isFirstPerson;
    }
}