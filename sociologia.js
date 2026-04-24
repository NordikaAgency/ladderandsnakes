const totalTiles = 55;
let currentPos = 1;
let isRolling = false;

// Configuración del tablero (Trampas y Preguntas)
const snakes = { 27: 8, 35: 5, 42: 21 }; // Inicio: Fin
const ladders = { 3: 24, 28: 37 };
const questionTiles = [5, 12, 20, 25, 42, 48, 51]; // Casillas con puntos amarillos

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

// Generar el Tablero dinámicamente
const container = document.getElementById('game-tiles');
for (let i = 1; i <= totalTiles; i++) {
    const tile = document.createElement('div');
    tile.id = `tile-${i}`;
    tile.classList.add('tile');
    tile.innerText = i;
    
    // Asignar clases de estilo según la configuración
    if (i === 1) tile.classList.add('start');
    if (i === totalTiles) { tile.classList.add('end'); tile.innerHTML = "55"; }
    if (questionTiles.includes(i)) tile.classList.add('special-question');
    
    container.appendChild(tile);
}

// Función de actualización visual de la ficha
function updatePlayerUI() {
    const tile = document.getElementById(`tile-${currentPos}`);
    const player = document.getElementById('player');
    const containerRect = document.getElementById('game-container').getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    
    // Calcular posición relativa al contenedor principal
    player.style.left = (tileRect.left - containerRect.left + 5) + 'px';
    player.style.top = (tileRect.top - containerRect.top + 5) + 'px';
}

function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = (modal.style.display === 'flex' ? 'none' : 'flex');
}

function rollDice() {
    if (isRolling) return;
    isRolling = true;
    const dice = document.getElementById('dice');
    const roll = Math.floor(Math.random() * 6) + 1;
    diceSound.currentTime = 0;
    diceSound.play();
    dice.innerText = roll;
    dice.style.transition = 'transform 0.5s ease';
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
        setTimeout(() => {
            alert("¡Felicidades! Has llegado a la meta.");
            currentPos = 1;
            updatePlayerUI();
        }, 300);
        return;
    }

    updatePlayerUI();

    setTimeout(() => {
        if (snakes[currentPos]) {
            alert("¡Cuidado! La cabeza de la serpiente te hace retroceder.");
            currentPos = snakes[currentPos];
            updatePlayerUI();
        } else if (ladders[currentPos]) {
            alert("¡Genial! La escalera te acerca más a la meta.");
            currentPos = ladders[currentPos];
            updatePlayerUI();
        } else if (questionTiles.includes(currentPos)) {
            showQuestion();
        }
    }, 500);
}

let currentQuestion = {};

function showQuestion() {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    document.getElementById('question-text').innerText = currentQuestion.text;
    toggleModal('modal-quiz');
}

// Inicializar posición de la ficha
window.onload = updatePlayerUI;

const diceSound = new Audio("sounds/dice.mp3");
const correctSound = new Audio("sounds/correct.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");

function checkAnswer(choice) {
    toggleModal('modal-quiz');
    if (choice === currentQuestion.type) {
        correctSound.currentTime = 0;
        correctSound.play();
        alert("¡Correcto!");
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play();
        alert("Incorrecto. Retrocedes 3 espacios.");
        currentPos = Math.max(1, currentPos - 3);
        updatePlayerUI();
    }
}

/* --- Al final de tu archivo sociologia.js, agregá estas funciones de dibujo --- */

function getTileCenter(num) {
    const tile = document.getElementById(`tile-${num}`);
    const gc = document.getElementById('game-container');
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
    const nx = (-dy / len) * 4, ny = (dx / len) * 4;

    [[nx, ny], [-nx, -ny]].forEach(([ox, oy]) => {
        svg.appendChild(svgEl('line', {
            x1: from.x + ox, y1: from.y + oy,
            x2: to.x + ox, y2: to.y + oy,
            stroke: '#8b5a2b', 'stroke-width': 3, 'stroke-linecap': 'round'
        }));
    });

    const n = Math.max(2, Math.floor(len / 15));
    for (let i = 1; i < n; i++) {
        const t = i / n;
        const rx = from.x + t * dx, ry = from.y + t * dy;
        svg.appendChild(svgEl('line', {
            x1: rx + nx * 1.5, y1: ry + ny * 1.5,
            x2: rx - nx * 1.5, y2: ry - ny * 1.5,
            stroke: '#d2a679', 'stroke-width': 2, 'stroke-linecap': 'round'
        }));
    }
}

function drawSnake(svg, fromNum, toNum) {
    const from = getTileCenter(fromNum);
    const to = getTileCenter(toNum);
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len, ny = dx / len;
    const amp = Math.min(len * 0.22, 20);
    const c1x = from.x * 0.55 + to.x * 0.45 + nx * amp;
    const c1y = from.y * 0.55 + to.y * 0.45 + ny * amp;
    const c2x = from.x * 0.45 + to.x * 0.55 - nx * amp;
    const c2y = from.y * 0.45 + to.y * 0.55 - ny * amp;
    const d = `M${from.x},${from.y} C${c1x},${c1y} ${c2x},${c2y} ${to.x},${to.y}`;

    svg.appendChild(svgEl('path', { d, stroke: '#2ecc71', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d, stroke: '#27ae60', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '6 6', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('circle', { cx: from.x, cy: from.y, r: 7, fill: '#27ae60' })); // Cabeza
    svg.appendChild(svgEl('circle', { cx: to.x, cy: to.y, r: 3, fill: '#27ae60' }));   // Cola
}

function drawBoardElements() {
    const svg = document.getElementById('board-svg');
    if (!svg) return;
    svg.innerHTML = '';
    // Dibujamos según las posiciones definidas en tu objeto 'ladders' y 'snakes'
    drawLadder(svg, 3, 24);
    drawLadder(svg, 37, 28);
    drawLadder(svg, 54, 55);
    
    drawSnake(svg, 27, 8);
    drawSnake(svg, 35, 5);
    drawSnake(svg, 42, 21);
}

// Modificá tu window.onload actual para que incluya el dibujo:
window.onload = () => {
    updatePlayerUI();
    // Esperamos un momento a que el navegador renderice las casillas antes de calcular centros
    setTimeout(drawBoardElements, 100); 
};

// Añadí esto para que se redibujen si cambias el tamaño de la ventana
window.onresize = drawBoardElements;


// Esta función ahora es más robusta para móviles
function drawBoardElements() {
    const svg = document.getElementById('board-svg');
    if (!svg) return;
    
    // Limpiamos el SVG antes de redibujar
    svg.innerHTML = '';

    // IMPORTANTE: Dibujamos solo si las casillas ya existen en el DOM
    const firstTile = document.getElementById('tile-1');
    if (!firstTile) return;

    // Dibujamos las escaleras
    if (ladders[3]) drawLadder(svg, 3, 24);
    if (ladders[37]) drawLadder(svg, 37, 28);
    // (Ya eliminamos la del 54 según pediste antes)

    // Dibujamos las serpientes
    drawSnake(svg, 27, 8);
    drawSnake(svg, 35, 5);
    drawSnake(svg, 42, 21);
    
    // Actualizamos la posición del jugador también al redibujar
    updatePlayerUI();
}

// Lógica para que sea Responsive Real-Time
const gameContainer = document.getElementById('game-container');
const ro = new ResizeObserver(() => {
    // Cada vez que el contenedor cambie aunque sea 1px, se redibuja todo
    drawBoardElements();
});

// Iniciamos la observación
ro.observe(gameContainer);

// Modificamos el onload para asegurar que la ficha aparezca
window.onload = () => {
    // Generar el tablero ya lo haces arriba en tu código
    setTimeout(() => {
        drawBoardElements();
        updatePlayerUI();
    }, 200); // Un pequeño delay ayuda a que el navegador asiente el layout
};
