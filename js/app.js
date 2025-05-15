import * as THREE from 'three';

export class BannerDistortionEffect {
    constructor() {
        this.banner = document.getElementById('banner');
        this.width = this.banner.offsetWidth;
        this.height = this.banner.offsetHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 0);
        this.banner.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();

        this.mouse = {
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            vX: 0,
            vY: 0
        };

        this.uniforms = {
            uTime: { value: 0 },
            uTexture: { value: null },
            uResolution: { value: new THREE.Vector2(this.width, this.height) },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uMouseVelocity: { value: new THREE.Vector2(0, 0) },
            uStrength: { value: 0.1 },
            uPixelSize: { value: 10 }
        };

        this.loadBackgroundTexture();
        this.addObjects();
        this.setupResize();
        this.mouseEvents();
        this.render();
    }

    loadBackgroundTexture() {
        const backgroundImage = getComputedStyle(this.banner).backgroundImage;
        const imageUrl = backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
        
        new THREE.TextureLoader().load(imageUrl, (texture) => {
            this.uniforms.uTexture.value = texture;
            this.updateTextureSize();
        });
    }

    updateTextureSize() {
        if (!this.uniforms.uTexture.value) return;

        const image = this.uniforms.uTexture.value.image;
        const imageAspect = image.height / image.width;
        const bannerAspect = this.height / this.width;

        let scale;
        if (bannerAspect > imageAspect) {
            scale = this.height / image.height;
        } else {
            scale = this.width / image.width;
        }

        this.uniforms.uTextureSize = { 
            value: new THREE.Vector2(image.width * scale, image.height * scale) 
        };
    }

    addObjects() {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform vec2 uResolution;
                uniform vec2 uTextureSize;
                uniform vec2 uMouse;
                uniform vec2 uMouseVelocity;
                uniform float uTime;
                uniform float uStrength;
                uniform float uPixelSize;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    
                    // Ajusta o UV para cobrir o banner mantendo a proporção da imagem
                    vec2 scale = uResolution / uTextureSize;
                    vec2 scaledUv = (uv - 0.5) * scale + 0.5;
                    
                    // Distorção baseada no mouse
                    vec2 mouseEffect = (uMouse - scaledUv) * uStrength;
                    scaledUv += mouseEffect;
                    
                    // Distorção baseada na velocidade do mouse
                    scaledUv += uMouseVelocity * uStrength * 10.0;
                    
                    // Efeito de pixelação
                    vec2 pixelatedUV = floor(scaledUv * uTextureSize / uPixelSize) * uPixelSize / uTextureSize;
                    
                    // Distorção senoidal animada
                    float distortion = sin(pixelatedUV.x * 10.0 + uTime) * 0.01;
                    pixelatedUV.y += distortion;

                    gl_FragColor = texture2D(uTexture, pixelatedUV);
                }
            `
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    mouseEvents() {
        this.banner.addEventListener('mousemove', (e) => {
            const rect = this.banner.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / this.width;
            this.mouse.y = 1 - (e.clientY - rect.top) / this.height;

            this.mouse.vX = this.mouse.x - this.mouse.prevX;
            this.mouse.vY = this.mouse.y - this.mouse.prevY;

            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;

            this.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
            this.uniforms.uMouseVelocity.value.set(this.mouse.vX, this.mouse.vY);
        });
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.banner.offsetWidth;
        this.height = this.banner.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.uniforms.uResolution.value.set(this.width, this.height);
        this.updateTextureSize();
    }

    render() {
        this.uniforms.uTime.value = this.clock.getElapsedTime();
        
        // Decaimento da velocidade do mouse
        this.uniforms.uMouseVelocity.value.multiplyScalar(0.9);

        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

// Uso:
new BannerDistortionEffect();
