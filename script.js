// --- ⚠️ ÁREA DE CONFIGURAÇÃO DAS FOTOS ⚠️ ---
const NOME_DA_SUA_FOTO = 'https://i.postimg.cc/RhyS4j4n/sua-foto.png';
const FOTOS_AMIGOS = [
    'https://i.postimg.cc/LsW2zcgG/amigo1.png', 'amigo2.png', 'amigo3.png', 'amigo4.png', 'amigo-especial.png'
];
const TODOS_OS_SIMBOLOS = [
    NOME_DA_SUA_FOTO,
    ...FOTOS_AMIGOS, ...FOTOS_AMIGOS, ...FOTOS_AMIGOS
];
const PREMIOS = {
    [NOME_DA_SUA_FOTO]: 50,
    'https://i.postimg.cc/LsW2zcgG/amigo1.png': 5,
    'https://i.postimg.cc/76CPdHyb/amigo2.png': 5,
    'https://i.postimg.cc/qBhgZLkL/amigo3.png': 10,
    'https://i.postimg.cc/BnG3p568/amigo4.png': 10,
    'https://i.postimg.cc/FRKNc9Kz/amigo-especial.png': 25
};

// --- (NOVA CONFIGURAÇÃO DE NOMES) ---
// Define os nomes que aparecerão na tela de Informações
const NOMES_PERSONAGENS = {
    [NOME_DA_SUA_FOTO]: "King (Wild)",
    'https://i.postimg.cc/LsW2zcgG/amigo1.png': "Corintiano",
    'https://i.postimg.cc/76CPdHyb/amigo2.png': "Jogador",
    'https://i.postimg.cc/qBhgZLkL/amigo3.png': "Playboy",
    'https://i.postimg.cc/BnG3p568/amigo4.png': "O Bruxo",
    'https://i.postimg.cc/FRKNc9Kz/amigo-especial.png': "Joinha"
};
// --------------------------------------------------

// --- VARIÁVEIS DO JOGO ---
let balance = 3409.27;
let currentBet = 20.00;
let isSpinning = false;
let autoSpinsRemaining = 0;
const betLevels = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00];
let currentBetIndex = betLevels.indexOf(currentBet);
let isAudioInitialized = false; 
let isMuted = false;

// --- ELEMENTOS DO DOM ---
const balanceDisplay = document.getElementById('balance-display');
const betDisplay = document.getElementById('bet-display');
const winDisplay = document.getElementById('win-display');
const spinButton = document.getElementById('spin-button');
const betUpButton = document.getElementById('bet-up');
const betDownButton = document.getElementById('bet-down');
const allSymbols = document.querySelectorAll('.symbol');
const spinLabel = document.getElementById('spin-label');

// --- Elementos do Modal Auto ---
const autoButton = document.getElementById('auto-button');
const autoModal = document.getElementById('auto-modal');
const autoCloseBtn = document.getElementById('auto-close-btn');
const autoOptionBtns = document.querySelectorAll('.auto-option-btn');

// --- Elementos do Loading e Áudio ---
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const gameWrapper = document.getElementById('game-wrapper');
const audioBgm = document.getElementById('audio-bgm');
const audioSpin = document.getElementById('audio-spin');
const audioWin = document.getElementById('audio-win');

// --- Novos Elementos (Mudo e Info) ---
const muteButton = document.getElementById('mute-button');
const allAudio = [audioBgm, audioSpin, audioWin];
const infoButton = document.getElementById('info-button');
const infoModal = document.getElementById('info-modal');
const infoCloseBtn = document.getElementById('info-close-btn');

// --- Variáveis de Jogo ---
let reelIntervals = [null, null, null];
let gridResults = [ ['', '', ''], ['', '', ''], ['', '', ''] ];


// --- LÓGICA DE CARREGAMENTO ---
window.addEventListener('load', () => {
    progressBar.style.width = '100%';

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameWrapper.style.display = 'flex';
        
        isAudioInitialized = true;
        audioBgm.muted = isMuted;
        audioBgm.play().catch(error => {
            console.log("Autoplay bloqueado. Áudio espera interação.");
            isAudioInitialized = false;
        });
    }, 3000); 
});

// --- FUNÇÃO PARA INICIAR ÁUDIO (FALLBACK) ---
function initializeAudioFallback() {
    if (isAudioInitialized) return;
    
    audioBgm.muted = isMuted;
    audioBgm.play().then(() => {
        isAudioInitialized = true;
    }).catch(e => {});
}

// --- FUNÇÕES DO JOGO ---
function updateDisplays() {
    balanceDisplay.textContent = `R$ ${balance.toFixed(2)}`;
    betDisplay.textContent = `R$ ${currentBet.toFixed(2)}`;
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * TODOS_OS_SIMBOLOS.length);
    return TODOS_OS_SIMBOLOS[randomIndex];
}

function resetBoard() {
    allSymbols.forEach(symbol => symbol.classList.remove('winning-symbol'));
    winDisplay.textContent = 'R$ 0.00';
}

// --- FUNÇÃO DE GIRAR ---
function spin() {
    if (isSpinning) return;
    
    if (balance < currentBet) {
        alert("Saldo insuficiente!");
        if (autoSpinsRemaining > 0) {
            autoSpinsRemaining = 0;
            spinLabel.textContent = '↻';
            autoButton.classList.remove('auto-active');
            autoButton.querySelector('span').innerHTML = '&#x1F504;'; // 🔄
        }
        return;
    }
    
    initializeAudioFallback();
    audioSpin.currentTime = 0;
    audioSpin.play();

    isSpinning = true;
    spinButton.disabled = true;
    
    balance -= currentBet;
    updateDisplays();
    resetBoard(); 

    // ... (Lógica de gerar resultado e flicker) ...
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            gridResults[row][col] = getRandomSymbol();
        }
    }
    for (let col = 0; col < 3; col++) {
        reelIntervals[col] = setInterval(() => {
            document.getElementById(`img-0-${col}`).src = `imagens/${getRandomSymbol()}`;
            document.getElementById(`img-1-${col}`).src = `imagens/${getRandomSymbol()}`;
            document.getElementById(`img-2-${col}`).src = `imagens/${getRandomSymbol()}`;
            document.getElementById(`img-0-${col}`).classList.add('spinning');
            setTimeout(() => document.getElementById(`img-0-${col}`).classList.remove('spinning'), 50);
        }, 80);
    }
    setTimeout(() => stopReel(0), 1500);
    setTimeout(() => stopReel(1), 2000);
    setTimeout(() => stopReel(2), 2500);
}

// Função para parar um rolo
function stopReel(col) {
    clearInterval(reelIntervals[col]);
    reelIntervals[col] = null;
    for (let row = 0; row < 3; row++) {
        const imgElement = document.getElementById(`img-${row}-${col}`);
        imgElement.src = `imagens/${gridResults[row][col]}`;
        imgElement.classList.remove('spinning');
    }
    if (col === 2) {
        checkAllWins(); 
    }
}

// --- VERIFICADOR DE GANHOS ---
function checkAllWins() {
    let totalWin = 0;
    const wild = NOME_DA_SUA_FOTO;
    const s = gridResults;

    const linesToCheck = [
        [ [s[0][0], s[0][1], s[0][2]], ['img-0-0', 'img-0-1', 'img-0-2'] ],
        [ [s[1][0], s[1][1], s[1][2]], ['img-1-0', 'img-1-1', 'img-1-2'] ],
        [ [s[2][0], s[2][1], s[2][2]], ['img-2-0', 'img-2-1', 'img-2-2'] ],
        [ [s[0][0], s[1][1], s[2][2]], ['img-0-0', 'img-1-1', 'img-2-2'] ],
        [ [s[2][0], s[1][1], s[0][2]], ['img-2-0', 'img-1-1', 'img-0-2'] ]
    ];

    // ... (Lógica de verificação de ganhos) ...
    for (const [lineSymbols, lineIDs] of linesToCheck) {
        const [s1, s2, s3] = lineSymbols;
        let winSymbol = null;
        if (s1 === s2 && s2 === s3) { winSymbol = s1;
        } else if (s1 === wild && s2 === s3) { winSymbol = s2;
        } else if (s2 === wild && s1 === s3) { winSymbol = s1;
        } else if (s3 === wild && s1 === s2) { winSymbol = s1;
        } else if (s1 === wild && s2 === wild) { winSymbol = s3;
        } else if (s1 === wild && s3 === wild) { winSymbol = s2;
        } else if (s2 === wild && s3 === wild) { winSymbol = s1;
        }
        if (winSymbol) {
            const winAmount = PREMIOS[winSymbol] * currentBet;
            totalWin += winAmount;
            for (const symbolId of lineIDs) {
                document.getElementById(symbolId).classList.add('winning-symbol');
            }
        }
    }

    if (totalWin > 0) {
        balance += totalWin;
        winDisplay.textContent = `R$ ${totalWin.toFixed(2)}`;
        audioWin.currentTime = 0;
        audioWin.play();
    }
    
    updateDisplays();
    isSpinning = false; 

    // --- LÓGICA DE AUTO-SPIN ---
    if (autoSpinsRemaining > 0) {
        autoSpinsRemaining--; 
    }
    if (autoSpinsRemaining > 0) {
        spinLabel.textContent = autoSpinsRemaining;
        if (balance < currentBet) {
            alert("Saldo insuficiente! Rodadas automáticas paradas.");
            autoSpinsRemaining = 0;
            spinLabel.textContent = '↻';
            spinButton.disabled = false;
            autoButton.classList.remove('auto-active');
            autoButton.querySelector('span').innerHTML = '&#x1F504;'; // 🔄
        } else {
            setTimeout(spin, 1000); 
        }
    } else {
        spinLabel.textContent = '↻';
        spinButton.disabled = false;
        if (autoButton.classList.contains('auto-active')) {
            autoButton.classList.remove('auto-active');
            autoButton.querySelector('span').innerHTML = '&#x1F504;'; // 🔄
        }
    }
}

// Função para ajustar a aposta
function adjustBet(direction) {
    if (isSpinning || autoSpinsRemaining > 0) return;
    currentBetIndex += direction;
    if (currentBetIndex < 0) currentBetIndex = 0;
    if (currentBetIndex >= betLevels.length) currentBetIndex = betLevels.length - 1;
    currentBet = betLevels[currentBetIndex];
    updateDisplays();
}

// --- FUNÇÃO PARA PREENCHER A TABELA DE PRÊMIOS (ATUALIZADA) ---
function populatePaytable() {
    const content = document.getElementById('info-paytable-content');
    content.innerHTML = ''; // Limpa o conteúdo anterior

    // Pega as chaves dos prêmios (nomes dos arquivos)
    const simbolos = Object.keys(PREMIOS);
    
    // Reordena para o King (Wild) vir primeiro
    simbolos.sort((a, b) => {
        if (a === NOME_DA_SUA_FOTO) return -1; // 'a' (Wild) vem antes
        if (b === NOME_DA_SUA_FOTO) return 1;  // 'b' (Wild) vem antes
        return 0; // Mantém a ordem original dos outros
    });

    // Cria as linhas da tabela de prêmios
    for (const simbolo of simbolos) {
        // Usa o objeto NOMES_PERSONAGENS para pegar o nome correto
        const nomePersonagem = NOMES_PERSONAGENS[simbolo] || simbolo.split('.')[0];
        const premio = PREMIOS[simbolo];
        const isWild = (simbolo === NOME_DA_SUA_FOTO);

        content.innerHTML += `
            <div class="paytable-row">
                <img src="imagens/${simbolo}" class="paytable-symbol">
                <div class="paytable-desc">
                    <strong>${nomePersonagem}</strong>
                    <p>Paga <strong>${premio}x</strong> por 3 na linha.</p>
                    ${isWild ? '<p>Substitui todos os outros símbolos!</p>' : ''}
                </div>
            </div>
        `;
    }
}


// --- EVENT LISTENERS ---

// Lógica do botão MUDO
muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    allAudio.forEach(audio => { audio.muted = isMuted; });
    muteButton.classList.toggle('muted', isMuted);
    muteButton.querySelector('span').innerHTML = isMuted ? '&#x1F515;' : '&#x1F514;'; // 🔕 ou 🔔
});

// Lógica do botão AUTO / PARAR
autoButton.addEventListener('click', () => {
    if (isSpinning && autoSpinsRemaining === 0) return; 
    if (autoSpinsRemaining > 0) {
        autoSpinsRemaining = 0;
        autoButton.classList.remove('auto-active');
        autoButton.querySelector('span').innerHTML = '&#x1F504;'; // 🔄
    } else {
        autoModal.classList.add('show');
    }
});

// Fecha o Modal Auto
autoCloseBtn.addEventListener('click', () => {
    autoModal.classList.remove('show');
});

// Escolhe uma opção de auto-spin
autoOptionBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        const spins = event.target.dataset.spins;
        autoSpinsRemaining = parseInt(spins); 
        initializeAudioFallback();
        spinLabel.textContent = autoSpinsRemaining;
        autoButton.classList.add('auto-active');
        autoButton.querySelector('span').innerHTML = '&#x23F9;'; // ⏹️
        autoModal.classList.remove('show');
        spin();
    });
});

// Event Listeners para o MODAL INFO
infoButton.addEventListener('click', () => {
    infoModal.classList.add('show');
});
infoCloseBtn.addEventListener('click', () => {
    infoModal.classList.remove('show');
});

// Event Listeners (Giro manual e Aposta)
spinButton.addEventListener('click', spin);
betUpButton.addEventListener('click', () => adjustBet(1));
betDownButton.addEventListener('click', () => adjustBet(-1));

// --- INICIALIZAÇÃO DO JOGO ---
updateDisplays(); // Atualiza visores
populatePaytable(); // Preenche a tabela de prêmios com os novos nomes
allAudio.forEach(audio => { // Seta o estado mudo inicial
    audio.muted = isMuted;

});
