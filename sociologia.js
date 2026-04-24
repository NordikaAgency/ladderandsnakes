const totalTiles = 55;
let currentPos = 1;
let isRolling = false;

// 1. Configuración del tablero (Trampas y Preguntas)
const snakes = { 27: 8, 35: 5, 42: 21 }; 
const ladders = { 3: 24, 28: 37 }; // Escaleras corregidas
const questionTiles = [5, 12, 20, 25, 42, 48, 51]; 

const questions = [
    { text: "El agua hierve a 100°C a nivel del mar.", type: "cientifico" },
    { text: "Si sales con el pelo mojado, te vas a resfriar.", type: "comun" },
    { text: "Cruzar los dedos trae buena suerte.", type: "comun" },
    { text: "La Tierra gira alrededor del Sol debido a la gravedad.", type: "cientifico" },
    { text: "Los murciélagos son ciegos.", type: "comun" },
    { text: "La penicilina mata bacterias, no virus.", type: "cientifico" },
    { text: "Las plantas crecen mejor si les hablas con amor.", type: "comun" },
    { text: "La vacunación crea inmunidad a través de pruebas científicas.", type: "cientifico" },
    { text: "La luna llena afecta el comportamiento de las personas.", type: "comun" },
    { text: "Los virus pueden reproducirse sin entrar en una célula.", type: "comun" },
    { text: "El hierro es más denso que el agua.", type: "cientifico" },
    { text: "Leer con poca luz daña los ojos permanentemente.", type: "comun" },
    { text: "Las bacterias siempre son perjudiciales para la salud.", type: "comun" },
    { text: "La fotosíntesis convierte luz solar en energía química.", type: "cientifico" },
    { text: "Masticar chicle permanece en el estómago 7 años.", type: "comun" }
];

// 2. Generar el Tablero
const container = document.getElementById('game-tiles');
for (let i = 1; i <= totalTiles; i++) {
    const tile = document.createElement('div');
    tile.id = `tile-${i}`;
    tile.classList.add('tile');
    tile.innerText = i;
    if (i === 1) tile.classList.add('start');
    if (i === totalTiles) tile.classList.add('end');
    if (questionTiles.includes(i)) tile.classList.add('special-question');
    container.appendChild(tile);
}

// 3. Funciones de Juego
function updatePlayerUI() {
    const tile = document.getElementById(`tile-${currentPos}`);
    const player = document.getElementById('player');
    const gc = document.getElementById('game-container');
    if (!tile || !player || !gc) return;

    const gcR = gc.getBoundingClientRect();
    const tR = tile.getBoundingClientRect();
    
    player.style.left = (tR.left - gcR.left + tR.width / 2 - player.offsetWidth / 2) + 'px';
    player.style.top = (tR.top - gcR.top + tR.height / 2 - player.offsetHeight / 2) + 'px';
}

function rollDice() {
    if (isRolling) return;
    isRolling = true;
    const dice = document.getElementById('dice');
    const roll = Math.floor(Math.random() * 6) + 1;
    diceSound.play();
    dice.innerText = roll;
    dice.style.transform = 'rotate(720deg) scale(1.15)';

    setTimeout(() => {
        dice.style.transform = 'rotate(0deg) scale(1)';
        movePlayer(roll);
        isRolling = false;
    }, 500);
}

function movePlayer(steps) {
    currentPos += steps;
    if (currentPos >= totalTiles) {
        currentPos = totalTiles;
        updatePlayerUI();
        setTimeout(() => { alert("¡Felicidades!"); currentPos = 1; updatePlayerUI(); }, 300);
        return;
    }
    updatePlayerUI();
    setTimeout(() => {
        if (snakes[currentPos]) {
            alert("¡Cuidado! La serpiente te hace retroceder.");
            currentPos = snakes[currentPos];
            updatePlayerUI();
        } else if (ladders[currentPos]) {
            alert("¡Genial! Una escalera.");
            currentPos = ladders[currentPos];
            updatePlayerUI();
        } else if (questionTiles.includes(currentPos)) {
            showQuestion();
        }
    }, 500);
}

// 4. Lógica de Dibujo SVG (Responsive)
function getTileCenter(num) {
    const tile = document.getElementById(`tile-${num}`);
    const gc = document.getElementById('game-container');
    if (!tile || !gc) return { x: 0, y: 0 };
    const gcR = gc.getBoundingClientRect();
    const tR = tile.getBoundingClientRect();
    return { 
        x: tR.left - gcR.left + tR.width / 2,
        y: tR.top - gcR.top + tR.height / 2 
    };
}

function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
}

function drawLadder(svg, fromNum, toNum) {
    const from = getTileCenter(fromNum);
    const to = getTileCenter(toNum);
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = (-dy / len) * 5, ny = (dx / len) * 5;

    [[nx, ny], [-nx, -ny]].forEach(([ox, oy]) => {
        svg.appendChild(svgEl('line', { x1: from.x + ox, y1: from.y + oy, x2: to.x + ox, y2: to.y + oy, stroke: '#8b5a2b', 'stroke-width': 3 }));
    });

    const n = Math.max(2, Math.floor(len / 15));
    for (let i = 1; i < n; i++) {
        const t = i / n;
        const rx = from.x + t * dx, ry = from.y + t * dy;
        svg.appendChild(svgEl('line', { x1: rx + nx * 1.5, y1: ry + ny * 1.5, x2: rx - nx * 1.5, y2: ry - ny * 1.5, stroke: '#d2a679', 'stroke-width': 2 }));
    }
}

function drawSnake(svg, fromNum, toNum) {
    const from = getTileCenter(fromNum);
    const to = getTileCenter(toNum);
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len, ny = dx / len;
    const amp = Math.min(len * 0.2, 25);
    const c1x = from.x * 0.6 + to.x * 0.4 + nx * amp;
    const c1y = from.y * 0.6 + to.y * 0.4 + ny * amp;
    const c2x = from.x * 0.4 + to.x * 0.6 - nx * amp;
    const c2y = from.y * 0.4 + to.y * 0.6 - ny * amp;
    const d = `M${from.x},${from.y} C${c1x},${c1y} ${c2x},${c2y} ${to.x},${to.y}`;

    svg.appendChild(svgEl('path', { d, stroke: '#2ecc71', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d, stroke: '#27ae60', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '6 6' }));
}

function drawBoardElements() {
    const svg = document.getElementById('board-svg');
    if (!svg) return;
    svg.innerHTML = '';
    
    // Dibujar Escaleras (según constantes)
    drawLadder(svg, 3, 24);
    drawLadder(svg, 28, 37);

    // Dibujar Serpientes (según constantes)
    drawSnake(svg, 27, 8);
    drawSnake(svg, 35, 5);
    drawSnake(svg, 42, 21);
    
    updatePlayerUI();
}

// 5. Inicialización y Eventos
const diceSound = new Audio("sounds/dice.mp3");
const correctSound = new Audio("sounds/correct.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");

window.onload = () => {
    setTimeout(drawBoardElements, 300);
};

const ro = new ResizeObserver(() => drawBoardElements());
ro.observe(document.getElementById('game-container'));

function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'flex' ? 'none' : 'flex');
}

function showQuestion() {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    document.getElementById('question-text').innerText = currentQuestion.text;
    toggleModal('modal-quiz');
}

function checkAnswer(choice) {
    toggleModal('modal-quiz');
    if (choice === currentQuestion.type) {
        correctSound.play();
        alert("¡Correcto!");
    } else {
        wrongSound.play();
        alert("Incorrecto. Retrocedes 3.");
        currentPos = Math.max(1, currentPos - 3);
        updatePlayerUI();
    }
}
