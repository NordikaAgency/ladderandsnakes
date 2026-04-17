const totalTiles = 55;
let currentPos = 1;
let isRolling = false;

// Configuración del tablero (Trampas y Preguntas)
const snakes = { 27: 8, 35: 5, 42: 21 }; // Inicio: Fin
const ladders = { 3: 24, 37: 28, 54: 55 };
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