import React, { useEffect, useRef } from 'react';

// Ce composant encapsule la simulation Three.js complète du cycle des roches
const CycleDesRochesSimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Créer un iframe avec le code HTML complet
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.style.overflow = 'hidden';

    // Le code HTML complet de la simulation
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cycle des Roches - Simulation Interactive</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
            color: white;
            overflow: hidden;
        }

        #container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }

        #info-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            max-width: 350px;
            z-index: 100;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        #parameters-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            max-width: 300px;
            z-index: 100;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        #controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            z-index: 100;
        }

        .control-btn {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 25px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            font-weight: bold;
            font-size: 14px;
        }

        .control-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: scale(1.05);
        }

        .control-btn.active {
            background: rgba(255, 215, 0, 0.3);
            border-color: #ffd700;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .legend-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
            font-size: 14px;
        }

        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .parameter-slider {
            margin: 15px 0;
        }

        .parameter-slider label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #ffd700;
        }

        .parameter-slider input {
            width: 100%;
            margin-bottom: 5px;
        }

        .parameter-value {
            font-size: 12px;
            color: #ccc;
            text-align: center;
        }

        .process-indicator {
            background: rgba(255, 100, 100, 0.8);
            padding: 8px;
            border-radius: 8px;
            margin: 8px 0;
            font-size: 12px;
            text-align: center;
        }

        .process-indicator.active {
            background: rgba(0, 255, 0, 0.8);
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
        }

        #title {
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            font-weight: bold;
            text-align: center;
            z-index: 99;
            background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: titlePulse 2s ease-in-out infinite alternate;
            pointer-events: none;
        }

        #subtitle {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.2rem;
            text-align: center;
            z-index: 99;
            color: #ccc;
            pointer-events: none;
        }

        @keyframes titlePulse {
            from { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }

        .fade-out {
            animation: fadeOut 1s ease-out forwards;
        }

        @keyframes fadeOut {
            to { opacity: 0; pointer-events: none; }
        }

        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.5rem;
            z-index: 98;
        }

        .transformation-info {
            background: rgba(0, 100, 255, 0.2);
            padding: 10px;
            border-radius: 8px;
            margin-top: 10px;
            border-left: 4px solid #4ecdc4;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="title">CYCLE DES ROCHES</div>
        <div id="subtitle">Simulation Interactive Éducative</div>
        <div id="loading">Chargement de la simulation...</div>
        
        <div id="info-panel" style="display: none;">
            <h3 id="rock-title">Cliquez sur une roche</h3>
            <p id="rock-description">Explorez les différents types de roches et leurs transformations.</p>
            <div id="rock-details"></div>
            <div id="transformation-info" class="transformation-info" style="display: none;"></div>
        </div>

        <div id="parameters-panel" style="display: none;">
            <h4>Paramètres de Transformation</h4>
            
            <div class="parameter-slider">
                <label for="temperature">Température (°C)</label>
                <input type="range" id="temperature" min="0" max="1200" value="400">
                <div class="parameter-value" id="temp-value">400°C</div>
            </div>

            <div class="parameter-slider">
                <label for="pressure">Pression (GPa)</label>
                <input type="range" id="pressure" min="0" max="10" value="3" step="0.1">
                <div class="parameter-value" id="pressure-value">3.0 GPa</div>
            </div>

            <div class="parameter-slider">
                <label for="time">Temps (millions d'années)</label>
                <input type="range" id="time" min="0.1" max="100" value="10" step="0.1">
                <div class="parameter-value" id="time-value">10.0 Ma</div>
            </div>

            <div id="process-indicators">
                <div class="process-indicator" id="erosion-indicator">Érosion</div>
                <div class="process-indicator" id="fusion-indicator">Fusion</div>
                <div class="process-indicator" id="metamorphism-indicator">Métamorphisme</div>
            </div>
        </div>

        <div id="controls" style="display: none;">
            <button class="control-btn" id="reset-btn">Réinitialiser</button>
            <button class="control-btn" id="auto-btn">Mode Auto</button>
            <button class="control-btn" id="pause-btn">Pause</button>
            <button class="control-btn" id="info-btn">Info Détaillée</button>
        </div>
    </div>

    <script>
        // Variables globales
        let scene, camera, renderer, raycaster, mouse;
        let rocks = [];
        let particles = [];
        let arrows = [];
        let isAutoMode = false;
        let animationId;
        let currentTransformation = null;
        let showDetailedInfo = false;

        // Types de roches avec leurs propriétés détaillées
        const rockTypes = {
            sedimentary: {
                name: 'Roches Sédimentaires',
                color: 0x8B4513,
                description: 'Formées par accumulation et compaction de sédiments',
                examples: 'Grès, calcaire, schiste argileux, conglomérat',
                formation: 'Érosion → Transport → Dépôt → Compaction → Cimentation',
                conditions: 'Température: 0-200°C, Pression: 0-0.5 GPa, Temps: 1-50 Ma',
                transformations: {
                    to_igneous: 'Fusion (T>1200°C)',
                    to_metamorphic: 'Métamorphisme (T>300°C, P>1 GPa)'
                }
            },
            igneous: {
                name: 'Roches Magmatiques',
                color: 0xFF4500,
                description: 'Formées par refroidissement et cristallisation du magma',
                examples: 'Granite, basalte, obsidienne, porphyre',
                formation: 'Fusion → Refroidissement → Cristallisation',
                conditions: 'Température: 600-1200°C, Pression: variable, Temps: 0.1-10 Ma',
                transformations: {
                    to_sedimentary: 'Érosion + Sédimentation',
                    to_metamorphic: 'Métamorphisme (T>400°C, P>0.5 GPa)'
                }
            },
            metamorphic: {
                name: 'Roches Métamorphiques',
                color: 0x2E8B57,
                description: 'Transformées par chaleur et pression sans fusion',
                examples: 'Marbre, schiste, gneiss, quartzite',
                formation: 'Pression + Chaleur → Recristallisation',
                conditions: 'Température: 300-800°C, Pression: 0.5-5 GPa, Temps: 5-100 Ma',
                transformations: {
                    to_sedimentary: 'Érosion + Sédimentation',
                    to_igneous: 'Fusion (T>800°C)'
                }
            }
        };

        // Initialisation
        function init() {
            // Création de la scène
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0a0a0a);

            // Caméra
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 8, 25);

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('container').appendChild(renderer.domElement);

            // Raycaster pour l'interaction
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            // Éclairage
            setupLighting();

            // Création des roches avec plus d'espacement
            createRocks();

            // Création des flèches de transformation
            createArrows();

            // Système de particules
            createParticleSystem();

            // Gestion des événements
            setupEventListeners();

            // Masquer le titre et afficher l'interface
            setTimeout(() => {
                document.getElementById('title').classList.add('fade-out');
                document.getElementById('subtitle').classList.add('fade-out');
                document.getElementById('loading').style.display = 'none';
                setTimeout(() => {
                    document.getElementById('info-panel').style.display = 'block';
                    document.getElementById('parameters-panel').style.display = 'block';
                    document.getElementById('controls').style.display = 'flex';
                }, 1000);
            }, 2000);

            // Animation
            animate();
        }

        function setupLighting() {
            // Lumière ambiante
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);

            // Lumière directionnelle principale
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(15, 20, 10);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);

            // Lumières colorées pour l'ambiance
            const redLight = new THREE.PointLight(0xff4500, 0.8, 50);
            redLight.position.set(-15, 8, 0);
            scene.add(redLight);

            const blueLight = new THREE.PointLight(0x4ecdc4, 0.8, 50);
            blueLight.position.set(15, 8, 0);
            scene.add(blueLight);

            const greenLight = new THREE.PointLight(0x2E8B57, 0.8, 50);
            greenLight.position.set(0, 8, -15);
            scene.add(greenLight);
        }

        function createRocks() {
            // Positions avec plus d'espacement (triangle plus large)
            const positions = [
                { x: -12, y: 0, z: -8, type: 'sedimentary' },
                { x: 12, y: 0, z: -8, type: 'igneous' },
                { x: 0, y: 0, z: 10, type: 'metamorphic' }
            ];

            positions.forEach((pos, index) => {
                // Géométrie irrégulière pour simuler une roche
                const geometry = new THREE.DodecahedronGeometry(2, 1);
                
                // Modification des vertices pour un aspect plus rocheux
                const vertices = geometry.attributes.position.array;
                for (let i = 0; i < vertices.length; i += 3) {
                    vertices[i] += (Math.random() - 0.5) * 0.5;
                    vertices[i + 1] += (Math.random() - 0.5) * 0.5;
                    vertices[i + 2] += (Math.random() - 0.5) * 0.5;
                }
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();

                const material = new THREE.MeshPhongMaterial({
                    color: rockTypes[pos.type].color,
                    shininess: 50,
                    transparent: true,
                    opacity: 0.9
                });

                const rock = new THREE.Mesh(geometry, material);
                rock.position.set(pos.x, pos.y, pos.z);
                rock.castShadow = true;
                rock.receiveShadow = true;
                rock.userData = { type: pos.type, originalColor: rockTypes[pos.type].color };

                // Animation de rotation
                rock.rotation.x = Math.random() * 2 * Math.PI;
                rock.rotation.y = Math.random() * 2 * Math.PI;

                scene.add(rock);
                rocks.push(rock);

                // Étiquette plus visible
                createLabel(rock, rockTypes[pos.type].name);
            });
        }

        function createLabel(rock, text) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 128;

            context.fillStyle = 'rgba(0, 0, 0, 0.9)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            context.lineWidth = 2;
            context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

            context.fillStyle = 'white';
            context.font = 'bold 28px Arial';
            context.textAlign = 'center';
            context.fillText(text, canvas.width / 2, canvas.height / 2 + 10);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(rock.position);
            sprite.position.y += 4;
            sprite.scale.set(6, 1.5, 1);

            scene.add(sprite);
        }

        function createArrows() {
            const arrowData = [
                { from: 0, to: 1, process: 'Fusion\\n(T>1200°C)', color: 0xff4500 },
                { from: 1, to: 2, process: 'Métamorphisme\\n(T:400-800°C, P>0.5GPa)', color: 0x2E8B57 },
                { from: 2, to: 0, process: 'Érosion\\n(Altération)', color: 0x8B4513 }
            ];

            arrowData.forEach((arrow, index) => {
                const fromPos = rocks[arrow.from].position;
                const toPos = rocks[arrow.to].position;
                const direction = new THREE.Vector3().subVectors(toPos, fromPos);
                const length = direction.length();
                direction.normalize();

                // Flèche plus visible
                const arrowGeometry = new THREE.ConeGeometry(0.5, 2, 8);
                const arrowMaterial = new THREE.MeshPhongMaterial({ 
                    color: arrow.color,
                    transparent: true,
                    opacity: 0.8
                });

                const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
                
                const startPos = fromPos.clone().add(direction.clone().multiplyScalar(3));
                const endPos = toPos.clone().sub(direction.clone().multiplyScalar(3));
                
                arrowMesh.position.copy(endPos);
                arrowMesh.lookAt(toPos);

                scene.add(arrowMesh);
                arrows.push({ mesh: arrowMesh, process: arrow.process });

                // Ligne de connexion plus épaisse
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: arrow.color,
                    transparent: true,
                    opacity: 0.6,
                    linewidth: 3
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);

                // Étiquette du processus
                createProcessLabel(startPos, endPos, arrow.process);
            });
        }

        function createProcessLabel(startPos, endPos, text) {
            const midPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
            midPos.y += 2;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 300;
            canvas.height = 100;

            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = '#ffd700';
            context.font = 'bold 16px Arial';
            context.textAlign = 'center';
            
            const lines = text.split('\\n');
            lines.forEach((line, i) => {
                context.fillText(line, canvas.width / 2, 30 + i * 20);
            });

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(midPos);
            sprite.scale.set(4, 1.5, 1);

            scene.add(sprite);
        }

        function createParticleSystem() {
            const particleCount = 2000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * 80;
                positions[i3 + 1] = (Math.random() - 0.5) * 80;
                positions[i3 + 2] = (Math.random() - 0.5) * 80;

                const color = new THREE.Color();
                color.setHSL(Math.random(), 0.8, 0.6);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;

                sizes[i] = Math.random() * 0.2 + 0.1;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const material = new THREE.PointsMaterial({
                size: 0.1,
                vertexColors: true,
                transparent: true,
                opacity: 0.4,
                sizeAttenuation: true
            });

            const particleSystem = new THREE.Points(geometry, material);
            scene.add(particleSystem);
            particles.push(particleSystem);
        }

        function setupEventListeners() {
            // Clic sur les roches
            renderer.domElement.addEventListener('click', onRockClick);
            renderer.domElement.addEventListener('mousemove', onMouseMove);

            // Contrôles
            document.getElementById('reset-btn').addEventListener('click', resetSimulation);
            document.getElementById('auto-btn').addEventListener('click', toggleAutoMode);
            document.getElementById('pause-btn').addEventListener('click', pauseSimulation);
            document.getElementById('info-btn').addEventListener('click', toggleDetailedInfo);

            // Paramètres
            document.getElementById('temperature').addEventListener('input', updateParameters);
            document.getElementById('pressure').addEventListener('input', updateParameters);
            document.getElementById('time').addEventListener('input', updateParameters);

            // Redimensionnement
            window.addEventListener('resize', onWindowResize);
        }

        function updateParameters() {
            const temp = document.getElementById('temperature').value;
            const pressure = document.getElementById('pressure').value;
            const time = document.getElementById('time').value;

            document.getElementById('temp-value').textContent = temp + '°C';
            document.getElementById('pressure-value').textContent = pressure + ' GPa';
            document.getElementById('time-value').textContent = time + ' Ma';

            // Mise à jour des indicateurs de processus
            updateProcessIndicators(temp, pressure, time);
        }

        function updateProcessIndicators(temp, pressure, time) {
            const erosionEl = document.getElementById('erosion-indicator');
            const fusionEl = document.getElementById('fusion-indicator');
            const metamorphismEl = document.getElementById('metamorphism-indicator');

            // Reset classes
            erosionEl.classList.remove('active');
            fusionEl.classList.remove('active');
            metamorphismEl.classList.remove('active');

            // Activation basée sur les paramètres
            if (temp < 300 && pressure < 1) {
                erosionEl.classList.add('active');
            }
            if (temp > 1000) {
                fusionEl.classList.add('active');
            }
            if (temp > 300 && temp < 1000 && pressure > 0.5) {
                metamorphismEl.classList.add('active');
            }
        }

        function onRockClick(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(rocks);

            if (intersects.length > 0) {
                const clickedRock = intersects[0].object;
                showRockInfo(clickedRock);
                startTransformation(clickedRock);
            }
        }

        function onMouseMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(rocks);

            // Reset all rocks
            rocks.forEach(rock => {
                rock.material.emissive.setHex(0x000000);
                rock.scale.set(1, 1, 1);
            });

            // Highlight hovered rock
            if (intersects.length > 0) {
                const hoveredRock = intersects[0].object;
                hoveredRock.material.emissive.setHex(0x444444);
                hoveredRock.scale.set(1.2, 1.2, 1.2);
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }
        }

        function showRockInfo(rock) {
            const rockData = rockTypes[rock.userData.type];
            document.getElementById('rock-title').textContent = rockData.name;
            document.getElementById('rock-description').textContent = rockData.description;
            
            let detailsHTML = \`
                <br><strong>Exemples:</strong> \${rockData.examples}
                <br><strong>Formation:</strong> \${rockData.formation}
            \`;

            if (showDetailedInfo) {
                detailsHTML += \`
                    <br><strong>Conditions:</strong> \${rockData.conditions}
                \`;
            }

            document.getElementById('rock-details').innerHTML = detailsHTML;

            // Afficher les transformations possibles
            const transformationInfo = document.getElementById('transformation-info');
            transformationInfo.style.display = 'block';
            transformationInfo.innerHTML = \`
                <strong>Transformations possibles:</strong><br>
                \${Object.entries(rockData.transformations).map(([key, value]) => 
                    \`• \${value}\`
                ).join('<br>')}
            \`;
        }

        function startTransformation(rock) {
            // Animation de transformation plus spectaculaire
            const originalScale = rock.scale.clone();
            const targetScale = new THREE.Vector3(2, 2, 2);

            let progress = 0;
            const transformAnimation = () => {
                progress += 0.03;
                if (progress <= 1) {
                    rock.scale.lerpVectors(originalScale, targetScale, Math.sin(progress * Math.PI * 2));
                    rock.rotation.y += 0.15;
                    rock.rotation.x += 0.1;
                    
                    // Effet de particules plus intense
                    createTransformationParticles(rock.position, rock.userData.type);
                    
                    requestAnimationFrame(transformAnimation);
                } else {
                    rock.scale.copy(originalScale);
                }
            };
            transformAnimation();
        }

        function createTransformationParticles(position, rockType) {
            const particleCount = 50;
            const color = rockTypes[rockType].color;

            for (let i = 0; i < particleCount; i++) {
                const particle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.1, 6, 6),
                    new THREE.MeshBasicMaterial({
                        color: color,
                        transparent: true,
                        opacity: 0.8
                    })
                );

                particle.position.copy(position);
                particle.position.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                ));

                const velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.1 + 0.05,
                    (Math.random() - 0.5) * 0.2
                );

                scene.add(particle);

                // Animation de particule
                let opacity = 0.8;
                const particleAnimation = () => {
                    opacity -= 0.01;
                    particle.material.opacity = opacity;
                    particle.position.add(velocity);
                    velocity.y -= 0.002; // Gravité
                    particle.scale.multiplyScalar(0.98);
                    
                    if (opacity > 0 && particle.scale.x > 0.1) {
                        requestAnimationFrame(particleAnimation);
                    } else {
                        scene.remove(particle);
                    }
                };
                particleAnimation();
            }
        }

        function toggleAutoMode() {
            isAutoMode = !isAutoMode;
            const btn = document.getElementById('auto-btn');
            btn.classList.toggle('active');
            btn.textContent = isAutoMode ? 'Arrêter Auto' : 'Mode Auto';

            if (isAutoMode) {
                autoTransformation();
            }
        }

        function autoTransformation() {
            if (!isAutoMode) return;

            const randomRock = rocks[Math.floor(Math.random() * rocks.length)];
            startTransformation(randomRock);
            showRockInfo(randomRock);

            // Simulation des paramètres automatiques
            const temp = Math.random() * 1200;
            const pressure = Math.random() * 10;
            const time = Math.random() * 100;

            document.getElementById('temperature').value = temp;
            document.getElementById('pressure').value = pressure;
            document.getElementById('time').value = time;

            updateParameters();

            setTimeout(() => {
                if (isAutoMode) autoTransformation();
            }, 4000);
        }

        function toggleDetailedInfo() {
            showDetailedInfo = !showDetailedInfo;
            const btn = document.getElementById('info-btn');
            btn.classList.toggle('active');
            btn.textContent = showDetailedInfo ? 'Info Simple' : 'Info Détaillée';
        }

        function resetSimulation() {
            // Réinitialiser les positions et rotations
            rocks.forEach((rock, index) => {
                rock.rotation.set(0, 0, 0);
                rock.scale.set(1, 1, 1);
                rock.material.emissive.setHex(0x000000);
            });

            // Arrêter le mode automatique
            isAutoMode = false;
            document.getElementById('auto-btn').classList.remove('active');
            document.getElementById('auto-btn').textContent = 'Mode Auto';

            // Réinitialiser les paramètres
            document.getElementById('temperature').value = 400;
            document.getElementById('pressure').value = 3;
            document.getElementById('time').value = 10;
            updateParameters();

            // Reset camera
            camera.position.set(0, 8, 25);
            camera.lookAt(0, 0, 0);

            // Masquer les informations de transformation
            document.getElementById('transformation-info').style.display = 'none';
        }

        function pauseSimulation() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
                document.getElementById('pause-btn').textContent = 'Reprendre';
                document.getElementById('pause-btn').classList.add('active');
            } else {
                animate();
                document.getElementById('pause-btn').textContent = 'Pause';
                document.getElementById('pause-btn').classList.remove('active');
            }
        }

        function animate() {
            animationId = requestAnimationFrame(animate);

            // Rotation des roches
            rocks.forEach((rock, index) => {
                rock.rotation.x += 0.003;
                rock.rotation.y += 0.007;
                
                // Animation flottante plus marquée
                rock.position.y = Math.sin(Date.now() * 0.001 + index * 2) * 0.5;
            });

            // Animation des particules de fond
            particles.forEach(particle => {
                particle.rotation.y += 0.001;
                particle.rotation.x += 0.0005;
            });

            // Animation des flèches
            arrows.forEach((arrow, index) => {
                arrow.mesh.material.opacity = 0.6 + Math.sin(Date.now() * 0.005 + index * 2) * 0.2;
                arrow.mesh.rotation.y += 0.01;
            });

            // Rotation automatique de la caméra
            const time = Date.now() * 0.0003;
            camera.position.x = Math.sin(time) * 30;
            camera.position.z = Math.cos(time) * 30;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Initialisation automatique des paramètres
        document.addEventListener('DOMContentLoaded', () => {
            updateParameters();
        });

        // Démarrage de l'application
        init();
    </script>
</body>
</html>
    `;

    // Créer un blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Assigner l'URL à l'iframe
    iframe.src = url;

    // Ajouter l'iframe au conteneur
    containerRef.current.appendChild(iframe);

    // Nettoyage
    return () => {
      if (containerRef.current && iframe.parentNode) {
        containerRef.current.removeChild(iframe);
      }
      URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '70vh', 
        borderRadius: 16, 
        overflow: 'hidden', 
        background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        margin: 'auto',
        border: '2px solid #333',
        position: 'relative'
      }} 
    />
  );
};

export default CycleDesRochesSimulation; 