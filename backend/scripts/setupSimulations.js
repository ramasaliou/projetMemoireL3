import { Simulation } from '../models/Simulation.js';
import { connectDB } from '../config/database.js';

const setupSimulations = async () => {
  try {
    await connectDB();
    
    // Supprimer toutes les simulations existantes
    await Simulation.destroy({ where: {} });
    console.log('🗑️ Toutes les simulations existantes supprimées');
    
    // Créer la simulation de fermentation
    const fermentationSimulation = await Simulation.create({
      title: 'Fermentation avec Pipette',
      description: 'Simulation interactive de fermentation alcoolique utilisant une pipette pour mélanger les ingrédients (eau, glucose, levure) et observer la production de CO₂.',
      category: 'Biologie',
      difficulty: 'Intermédiaire',
      duration: '15-20 minutes',
      objectives: [
        'Comprendre le processus de fermentation alcoolique',
        'Apprendre à utiliser une pipette en laboratoire',
        'Observer la production de CO₂ lors de la fermentation',
        'Comprendre l\'influence de la température sur la fermentation'
      ],
      materials: [
        'Pipette',
        'Tubes à essai (eau, glucose, levure)',
        'Bécher',
        'Plaque chauffante',
        'Thermomètre'
      ],
      instructions: [
        '1. Cliquez ou faites glisser la pipette dans un tube pour prélever',
        '2. Déplacez‑la au‑dessus du bécher puis cliquez ou relâchez pour verser.',
        '3. Répétez pour tous les ingrédients.',
        '4. Chauffez à 30&nbsp;°C et observez&nbsp;!'
      ],
      content: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simulation de Fermentation avec Pipette</title>
    <style>
        /* ---------------------------------- GLOBAL ---------------------------------- */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: "Arial", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            position: relative;
            cursor: crosshair;
        }

        /* -------------------------------- LAB BACKGROUND ---------------------------- */
        #lab-container {
            position: absolute;
            inset: 0;
            background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><line x1='0' y1='50' x2='100' y2='50' stroke='%23e0e0e0' stroke-width='0.5'/><line x1='50' y1='0' x2='50' y2='100' stroke='%23e0e0e0' stroke-width='0.5'/></svg>")
                repeat;
            background-size: 50px 50px;
        }
        .lab-bench {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 180px;
            background: linear-gradient(to bottom, #8b4513, #654321);
            border-top: 5px solid #a0522d;
            box-shadow: 0 -10px 20px rgba(0, 0, 0, 0.3);
        }

        /* ---------------------------------- TITLES ---------------------------------- */
        .title {
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.8rem;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            background: linear-gradient(45deg, #ffd700, #ffa500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
        }

        /* -------------------------------- GUIDES & PANELS --------------------------- */
        .instructions,
        .controls-panel,
        .step-indicator,
        .observations {
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        .instructions {
            position: absolute;
            top: 70px;
            left: 20px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            padding: 15px;
            max-width: 300px;
            font-size: 14px;
        }
        .controls-panel {
            position: absolute;
            right: 20px;
            top: 70px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 15px;
            min-width: 200px;
        }
        .btn {
            display: block;
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-heat {
            background: linear-gradient(45deg, #ff5722, #f44336);
            color: #fff;
        }
        .btn-reset {
            background: linear-gradient(45deg, #607d8b, #455a64);
            color: #fff;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        /* ---------------------------------- GLASSWARE -------------------------------- */
        .test-tube {
            position: absolute;
            bottom: 180px;
            width: 50px;
            height: 150px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
            border: 2px solid #999;
            border-radius: 0 0 25px 25px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .test-tube:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        }
        .tube-content {
            position: absolute;
            bottom: 0;
            width: 100%;
            transition: all 0.3s ease;
            border-radius: 0 0 23px 23px;
        }
        .tube-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 11px;
            font-weight: bold;
            color: #333;
            background: rgba(255, 255, 255, 0.9);
            padding: 2px 6px;
            border-radius: 8px;
            white-space: nowrap;
        }
        .water-tube {
            left: 150px;
        }
        .glucose-tube {
            left: 220px;
        }
        .yeast-tube {
            left: 290px;
        }

        .beaker {
            position: absolute;
            bottom: 180px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 160px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
            border: 3px solid #999;
            border-radius: 0 0 15px 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .beaker-content {
            position: absolute;
            bottom: 0;
            width: 100%;
            transition: all 0.5s ease;
            border-radius: 0 0 12px 12px;
        }
        .beaker-label {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            font-weight: bold;
            color: #333;
            background: rgba(255, 255, 255, 0.9);
            padding: 3px 8px;
            border-radius: 10px;
        }

        /* ---------------------------------- PIPETTE ---------------------------------- */
        .pipette {
            position: absolute;
            width: 8px;
            height: 100px;
            background: linear-gradient(to bottom, #ddd, #bbb);
            border: 1px solid #999;
            border-radius: 4px;
            cursor: grab;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        .pipette:active {
            cursor: grabbing;
        }
        .pipette-tip {
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 15px;
            background: #999;
            border-radius: 0 0 2px 2px;
        }
        .pipette-bulb {
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background: radial-gradient(circle, #ff6b6b, #ee5a52);
            border-radius: 50%;
            border: 1px solid #999;
        }
        .pipette-liquid {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 0;
            transition: all 0.3s ease;
            border-radius: 3px 3px 0 0;
        }

        /* ---------------------------------- HEATING ---------------------------------- */
        .heating-plate {
            position: absolute;
            bottom: 150px;
            left: 50%;
            transform: translateX(-50%);
            width: 140px;
            height: 20px;
            background: linear-gradient(45deg, #333, #555);
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        .heating-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            background: #4caf50;
            border-radius: 50%;
            opacity: 0;
            transition: all 0.3s ease;
        }
        .heating-indicator.active {
            opacity: 1;
            background: #ff5722;
            box-shadow: 0 0 10px #ff5722;
            animation: pulse 1s infinite;
        }
        .temperature-display {
            position: absolute;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 14px;
        }

        /* ---------------------------------- BUBBLES ---------------------------------- */
        .bubbles {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }
        .bubble {
            position: absolute;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            animation: bubble-rise 2s infinite ease-in-out;
        }
        @keyframes bubble-rise {
            0% {
                bottom: 0;
                opacity: 1;
                transform: scale(0.5);
            }
            50% {
                opacity: 0.7;
                transform: scale(1);
            }
            100% {
                bottom: 100%;
                opacity: 0;
                transform: scale(0.3);
            }
        }
        @keyframes pulse {
            0%,
            100% {
                transform: translate(-50%, -50%) scale(1);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.2);
            }
        }

        /* ---------------------------------- LOG PANEL -------------------------------- */
        .observations {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 15px;
            max-height: 120px;
            overflow-y: auto;
        }
        .observation-item {
            margin-bottom: 5px;
            padding: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            font-size: 12px;
        }

        /* ---------------------------------- STEP IND --------------------------------- */
        .step-indicator {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 10px;
            font-size: 12px;
            min-width: 150px;
        }
        .step-active {
            color: #4caf50;
            font-weight: bold;
        }

        .measuring-marks {
            position: absolute;
            right: 5px;
            top: 20px;
            height: 120px;
            width: 2px;
            background: repeating-linear-gradient(to bottom, #999 0px, #999 1px, transparent 1px, transparent 10px);
        }

        /* ---------------------------------- CO2 COUNTER ----------------------------- */
        #co2-counter {
            position: absolute;
            right: 20px;
            bottom: 170px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            padding: 6px 10px;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            display: none;
        }
        #co2-counter.danger {
            background: rgba(255, 87, 34, 0.9);
            color: #fff;
        }

        /* ---------------------------------- MEDIA QUERIES --------------------------- */
        @media (max-width: 600px) {
            .test-tube {
                width: 40px;
                height: 110px;
            }
            .lab-bench {
                height: 140px;
            }
            .beaker {
                width: 90px;
                height: 120px;
            }
            .heating-plate {
                width: 110px;
                bottom: 120px;
            }
            .temperature-display {
                bottom: 95px;
            }
        }
    </style>
</head>
<body>
    <div id="lab-container">
        <div class="lab-bench"></div>

        <div class="title">🧪 Expérience de Fermentation avec Pipette</div>

        <div class="instructions" aria-label="Instructions pour l'expérience">
            <strong>📋 Instructions&nbsp;:</strong><br />
            1. Cliquez ou faites glisser la pipette dans un tube pour prélever.<br />
            2. Déplacez‑la au‑dessus du bécher puis cliquez ou relâchez pour verser.<br />
            3. Répétez pour tous les ingrédients.<br />
            4. Chauffez à 30&nbsp;°C et observez&nbsp;!
        </div>

        <div class="controls-panel" aria-label="Panneau de contrôle">
            <h4>🔧 Contrôles</h4>
            <button class="btn btn-heat" onclick="toggleHeating()" aria-label="Lancer ou arrêter le chauffage">🔥 Chauffer à 30&nbsp;°C</button>
            <button class="btn btn-reset" onclick="resetExperiment()" aria-label="Réinitialiser l'expérience">🔄 Recommencer</button>
            <div style="margin-top: 10px">
                <strong>Température&nbsp;:</strong>
                <div id="temp-display" style="color: #4caf50">25&nbsp;°C</div>
            </div>
        </div>

        <div class="step-indicator" aria-label="Progression des étapes de l'expérience">
            <div id="step1" class="step-active">1. Prélever l'eau 💧</div>
            <div id="step2">2. Prélever le glucose 🍯</div>
            <div id="step3">3. Prélever la levure 🦠</div>
            <div id="step4">4. Chauffer et observer 🔥</div>
        </div>

        <!-- Tubes à essai -->
        <div class="test-tube water-tube" role="button" aria-label="Tube à essai - eau" onclick="selectTube('water')">
            <div class="tube-content" style="height: 100px; background: linear-gradient(to bottom, #4fc3f7, #29b6f6)"></div>
            <div class="tube-label">💧 Eau</div>
            <div class="measuring-marks"></div>
        </div>

        <div class="test-tube glucose-tube" role="button" aria-label="Tube à essai - glucose" onclick="selectTube('glucose')">
            <div class="tube-content" style="height: 80px; background: linear-gradient(to bottom, #ffb74d, #ff9800)"></div>
            <div class="tube-label">🍯 Glucose</div>
            <div class="measuring-marks"></div>
        </div>

        <div class="test-tube yeast-tube" role="button" aria-label="Tube à essai - levure" onclick="selectTube('yeast')">
            <div class="tube-content" style="height: 60px; background: linear-gradient(to bottom, #8bc34a, #689f38)"></div>
            <div class="tube-label">🦠 Levure</div>
            <div class="measuring-marks"></div>
        </div>

        <!-- Bécher -->
        <div class="beaker" role="button" aria-label="Bécher" onclick="addToBeaker()">
            <div class="beaker-content" id="beaker-content" style="height: 0; background: transparent"></div>
            <div class="beaker-label">🥤 Bécher</div>
            <div class="bubbles" id="bubbles"></div>
        </div>

        <!-- Plaque chauffante -->
        <div class="heating-plate">
            <div class="heating-indicator" id="heating-indicator"></div>
        </div>
        <div class="temperature-display" id="temperature-display">25&nbsp;°C</div>

        <!-- Pipette -->
        <div class="pipette" id="pipette" style="left: 100px; top: 200px">
            <div class="pipette-tip"></div>
            <div class="pipette-bulb"></div>
            <div class="pipette-liquid" id="pipette-liquid"></div>
        </div>

        <!-- Compteur CO2 -->
        <div id="co2-counter">CO₂&nbsp;: <span id="co2-value">0</span>&nbsp;mL</div>

        <!-- Observations -->
        <div class="observations" aria-label="Journal des observations">
            <h4>📊 Observations</h4>
            <div id="observations">
                <div class="observation-item">🔬 Prêt à commencer l'expérience de fermentation</div>
            </div>
        </div>
    </div>

    <script>
        /* ---------------------------- EXPÉRIENCE STATE ---------------------------- */
        let experiment = {
            temperature: 25,
            heating: false,
            pipetteContent: null,
            beakerContents: [],
            fermentationActive: false,
        };
        let co2Interval = null;
        const colors = {
            water: "#4fc3f7",
            glucose: "#ffb74d",
            yeast: "#8bc34a",
        };

        /* ------------------------------- SÉLECTION TUBE ---------------------------- */
        function selectTube(tubeType) {
            if (experiment.pipetteContent) {
                addObservation("⚠️ Videz d'abord la pipette dans le bécher");
                return;
            }
            experiment.pipetteContent = tubeType;
            const pipetteLiquid = document.getElementById("pipette-liquid");
            pipetteLiquid.style.height = "40px";
            pipetteLiquid.style.background = colors[tubeType];
            addObservation(\`💉 \${getIngredientName(tubeType)} prélevé avec la pipette\`);
        }

        /* ------------------------------- AJOUT BÉCHER ------------------------------ */
        function addToBeaker() {
            if (!experiment.pipetteContent) {
                addObservation("⚠️ Prélevez d'abord un ingrédient avec la pipette");
                return;
            }
            experiment.beakerContents.push(experiment.pipetteContent);
            document.getElementById("pipette-liquid").style.height = "0px";
            addObservation(\`✅ \${getIngredientName(experiment.pipetteContent)} ajouté au bécher\`);
            experiment.pipetteContent = null;
            updateBeaker();
            updateSteps();
            if (experiment.beakerContents.length === 3) {
                addObservation("🎉 Tous les ingrédients sont mélangés ! Vous pouvez maintenant chauffer.");
                document.getElementById("step4").classList.add("step-active");
            }
        }

        function updateBeaker() {
            const beakerContent = document.getElementById("beaker-content");
            if (experiment.beakerContents.length === 0) {
                beakerContent.style.height = "0px";
                beakerContent.style.background = "transparent";
                return;
            }
            const h = experiment.beakerContents.length * 30;
            let gradient = "linear-gradient(to top,";
            experiment.beakerContents.forEach((c, i) => {
                gradient += colors[c] + (i < experiment.beakerContents.length - 1 ? "," : ")");
            });
            if (experiment.beakerContents.length >= 3) gradient = "linear-gradient(to top, #9c8b4a, #b8a963, #8bc34a)";
            beakerContent.style.height = h + "px";
            beakerContent.style.background = gradient;
        }

        /* ------------------------------- ÉTAPES UI --------------------------------- */
        function updateSteps() {
            ["step1", "step2", "step3", "step4"].forEach((id) => document.getElementById(id).classList.remove("step-active"));
            if (experiment.beakerContents.length < 3) document.getElementById("step" + (experiment.beakerContents.length + 1)).classList.add("step-active");
        }

        /* ------------------------------- CHAUFFAGE ---------------------------------- */
        function toggleHeating() {
            if (experiment.beakerContents.length < 3) {
                addObservation("⚠️ Ajoutez tous les ingrédients avant de chauffer");
                return;
            }
            experiment.heating = !experiment.heating;
            document.getElementById("heating-indicator").classList.toggle("active", experiment.heating);
            if (experiment.heating) {
                addObservation("🔥 Chauffage démarré - montée vers 30 °C");
                startHeating();
            } else {
                addObservation("❄️ Chauffage arrêté");
                stopHeating();
            }
        }
        function startHeating() {
            const target = 30;
            const int = setInterval(() => {
                if (!experiment.heating) return clearInterval(int);
                if (experiment.temperature < target) {
                    experiment.temperature += 0.5;
                    updateTemperatureDisplay();
                    if (experiment.temperature >= target) {
                        clearInterval(int);
                        startFermentation();
                    }
                }
            }, 200);
        }

        function stopHeating() {
            experiment.fermentationActive = false;
            clearInterval(co2Interval);
            document.getElementById("bubbles").innerHTML = "";
            document.getElementById("co2-counter").style.display = "none";
        }

        /* ------------------------------- FERMENTATION ------------------------------ */
        function startFermentation() {
            experiment.fermentationActive = true;
            addObservation("🔄 Fermentation active ! Température optimale atteinte.");
            addObservation("💨 Formation de bulles de CO₂ observée");
            createBubbles();
            initCo2Counter();
            setTimeout(() => addObservation("🧪 Dégagement gazeux intense – fermentation alcoolique"), 3000);
            setTimeout(() => addObservation("📈 Production d'éthanol et CO₂ par la levure"), 6000);
        }

        /* --------------- CO2 COUNTER --------------- */
        function initCo2Counter() {
            let co2 = 0;
            const el = document.getElementById("co2-counter");
            const val = document.getElementById("co2-value");
            el.classList.remove("danger");
            val.textContent = co2;
            el.style.display = "block";
            co2Interval = setInterval(() => {
                if (!experiment.fermentationActive) return clearInterval(co2Interval);
                co2 += Math.floor(Math.random() * 4) + 2; // 2–5 mL
                val.textContent = co2;
                if (co2 >= 80) el.classList.add("danger");
            }, 800);
        }

        /* --------------- BULLES --------------- */
        function createBubbles() {
            if (!experiment.fermentationActive) return;
            const bubbles = document.getElementById("bubbles");
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    if (!experiment.fermentationActive) return;
                    const b = document.createElement("div");
                    b.className = "bubble";
                    b.style.left = Math.random() * 80 + 10 + "%";
                    const size = Math.random() * 6 + 3;
                    b.style.width = b.style.height = size + "px";
                    b.style.animationDelay = Math.random() * 1 + "s";
                    bubbles.appendChild(b);
                    setTimeout(() => bubbles.removeChild(b), 2000);
                }, i * 500);
            }
            setTimeout(createBubbles, 3000);
        }

        /* --------------- TEMP DISPLAY --------------- */
        function updateTemperatureDisplay() {
            const d = document.getElementById("temperature-display");
            d.textContent = Math.round(experiment.temperature) + " °C";
            d.style.color = experiment.temperature >= 30 ? "#ff5722" : experiment.temperature >= 27 ? "#ff9800" : "#4caf50";
        }

        /* --------------- OBSERVATIONS --------------- */
        function addObservation(txt) {
            const obs = document.getElementById("observations");
            const item = document.createElement("div");
            item.className = "observation-item";
            const time = new Date().toLocaleTimeString("fr-FR", { timeStyle: "short" });
            item.textContent = \`⏰ \${time} – \${txt}\`;
            obs.appendChild(item);
            while (obs.children.length > 8) obs.removeChild(obs.firstChild);
            obs.scrollTop = obs.scrollHeight;
        }

        function getIngredientName(t) {
            return { water: "Eau", glucose: "Glucose", yeast: "Levure" }[t];
        }

        /* --------------- RESET --------------- */
        function resetExperiment() {
            experiment = { temperature: 25, heating: false, pipetteContent: null, beakerContents: [], fermentationActive: false };
            clearInterval(co2Interval);
            document.getElementById("beaker-content").style.height = "0px";
            document.getElementById("beaker-content").style.background = "transparent";
            document.getElementById("pipette-liquid").style.height = "0px";
            document.getElementById("heating-indicator").classList.remove("active");
            document.getElementById("bubbles").innerHTML = "";
            document.getElementById("temperature-display").textContent = "25 °C";
            document.getElementById("temperature-display").style.color = "#4caf50";
            ["step1", "step2", "step3", "step4"].forEach((id) => document.getElementById(id).classList.remove("step-active"));
            document.getElementById("step1").classList.add("step-active");
            document.getElementById("observations").innerHTML = '<div class="observation-item">🔬 Expérience réinitialisée – Prêt à recommencer</div>';
            document.getElementById("pipette").style.cssText += "left:100px;top:200px;transform:none;";
            document.getElementById("co2-counter").style.display = "none";
            addObservation("🔄 Nouvelle expérience prête à commencer");
        }

        /* ----------------------- DRAG‑AND‑DROP PIPETTE ------------------------ */
        const pipetteEl = document.getElementById("pipette");
        let dragging = false, offsetX = 0, offsetY = 0;
        pipetteEl.addEventListener("pointerdown", (e) => {
            dragging = true;
            pipetteEl.setPointerCapture(e.pointerId);
            const rect = pipetteEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });
        pipetteEl.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            pipetteEl.style.left = e.clientX - offsetX + "px";
            pipetteEl.style.top = e.clientY - offsetY + "px";
        });
        pipetteEl.addEventListener("pointerup", (e) => {
            dragging = false;
            pipetteEl.releasePointerCapture(e.pointerId);
            // Collision simple – tubes
            document.querySelectorAll(".test-tube").forEach((t) => {
                const r = t.getBoundingClientRect();
                if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
                    if (t.classList.contains("water-tube")) selectTube("water");
                    else if (t.classList.contains("glucose-tube")) selectTube("glucose");
                    else selectTube("yeast");
                }
            });
            // Collision – bécher
            const b = document.querySelector(".beaker").getBoundingClientRect();
            if (e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom) addToBeaker();
        });

        /* INIT */
        addObservation("🔬 Laboratoire prêt – Cliquez ou faites glisser la pipette pour commencer");
    </script>
</body>
</html>`,
      tags: ['fermentation', 'pipette', 'biologie', 'interactif', 'CO2'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Simulation de fermentation créée avec succès');
    
    // Afficher toutes les simulations
    const allSimulations = await Simulation.findAll();
    console.log('📊 Simulations dans la base de données:');
    allSimulations.forEach(sim => {
      console.log(`  - ${sim.title} (${sim.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des simulations:', error);
    process.exit(1);
  }
};

setupSimulations(); 