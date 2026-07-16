const paraSelect = document.getElementById('para-select');
const timeSelect = document.getElementById('time-select');
const targetTextDisplay = document.getElementById('target-text');
const inputField = document.getElementById('input-field');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const muteBtn = document.getElementById('mute-btn');
const resultsModal = document.getElementById('results-modal');

// UI Layout Node Connections
const workspaceWrapper = document.getElementById('typing-workspace-wrapper');
const multiControlsContainer = document.getElementById('multiplayer-controls-container');
const lobbySetupControls = document.getElementById('lobby-setup-controls');
const lobbyActiveDashboard = document.getElementById('lobby-active-dashboard');
const currentRoomCodeTxt = document.getElementById('current-room-code-txt');
const lobbyPlayersRoster = document.getElementById('lobby-players-roster');
const lobbyInteractionPanel = document.getElementById('lobby-management-interaction');
const modeSingleBtn = document.getElementById('mode-single-btn');
const modeMultiBtn = document.getElementById('mode-multi-btn');

let currentTargetText = "";
let startTime;
let timerInterval;
let pollingInterval = null;
let isTestRunning = false;
let timeLimit = 0; 

// Global Interactive Environment Identifiers
let activeGameMode = 'single'; // Default mode config
let trackedRoomCode = null;
let amIHost = false;

let audioCtx = null;
let isMuted = false;

function init() { 
    changeParagraph(); 
    switchMode('single'); // Boot the workspace up into standard single-player workflow instantly
}

// Dynamic Engine Mode Switching System Configuration
function switchMode(mode) {
    activeGameMode = mode;
    if (pollingInterval) clearInterval(pollingInterval);

    if (mode === 'single') {
        modeSingleBtn.className = "btn-primary";
        modeMultiBtn.className = "btn-secondary";
        multiControlsContainer.style.display = 'none';
        setWorkspaceVisibility(false); // Make workspace readable and accessible instantly
        resetTest();
    } else {
        modeSingleBtn.className = "btn-secondary";
        modeMultiBtn.className = "btn-primary";
        multiControlsContainer.style.display = 'block';
        lobbySetupControls.style.display = 'block';
        lobbyActiveDashboard.style.display = 'none';
        setWorkspaceVisibility(true); // Mask workspace until multiplayer match begins
        resetTest();
    }
}

function setWorkspaceVisibility(shouldBlurAndDisable) {
    if (shouldBlurAndDisable) {
        workspaceWrapper.classList.add('hidden-workspace');
        inputField.disabled = true;
        inputField.placeholder = "Arena locked. Connect to a room lobby to begin...";
    } else {
        workspaceWrapper.classList.remove('hidden-workspace');
        inputField.disabled = false;
        inputField.placeholder = "Click here and start typing to begin the test...";
    }
}

function playClickSound() {
    if (isMuted) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
}

function toggleMute() {
    isMuted = !isMuted;
    muteBtn.innerText = isMuted ? "🔇 Sound: Muted" : "🔊 Sound: On";
    if (!isMuted) playClickSound();
    inputField.focus();
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break;
            }
        }
    }
    return cookieValue;
}

function changeParagraph() {
    resetTest();
    currentTargetText = paraSelect.value;
    if (!currentTargetText) return;
    
    targetTextDisplay.innerHTML = "";
    currentTargetText.split("").forEach(char => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.innerText = char;
        targetTextDisplay.appendChild(span);
    });
}

inputField.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') playClickSound();
});

inputField.addEventListener('input', () => {
    if (!currentTargetText) return;
    if (!isTestRunning && inputField.value.length > 0) {
        isTestRunning = true;
        startTime = new Date();
        const selectedTime = timeSelect.value;
        timeLimit = selectedTime === 'none' ? 0 : parseInt(selectedTime);
        timerInterval = setInterval(updateTimer, 1000);
    }

    const typedText = inputField.value;
    const charSpans = targetTextDisplay.querySelectorAll('.char');
    let correctChars = 0;

    charSpans.forEach((span, index) => {
        const userChar = typedText[index];
        if (userChar == null) {
            span.classList.remove('correct', 'incorrect');
        } else if (userChar === span.innerText) {
            span.classList.add('correct'); span.classList.remove('incorrect'); correctChars++;
        } else {
            span.classList.add('incorrect'); span.classList.remove('correct');
        }
    });
    
    const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
    accuracyDisplay.innerText = accuracy;

    if (typedText === currentTargetText) handleTestCompletion(accuracy, true);
});

function updateTimer() {
    if (!isTestRunning) return;
    const timeElapsed = Math.floor((new Date() - startTime) / 1000);
    const typedLength = inputField.value.length;

    if (timeLimit > 0) {
        const timeRemaining = timeLimit - timeElapsed;
        if (timeRemaining <= 0) {
            timerDisplay.innerText = "0";
            wpmDisplay.innerText = timeLimit > 0 && typedLength > 0 ? Math.round((typedLength / 5) / (timeLimit / 60)) : 0;
            handleTestCompletion(parseInt(accuracyDisplay.innerText), false);
            return;
        }
        timerDisplay.innerText = timeRemaining;
    } else {
        timerDisplay.innerText = timeElapsed;
    }

    if (timeElapsed > 0 && typedLength > 0) {
        wpmDisplay.innerText = Math.round((typedLength / 5) / (timeElapsed / 60));
    }
}

function handleTestCompletion(finalAccuracy, isComplete) {
    clearInterval(timerInterval);
    isTestRunning = false;
    inputField.disabled = true;
    
    const finalWpm = wpmDisplay.innerText;
    const selectedOption = paraSelect.options[paraSelect.selectedIndex];
    const paragraphTitle = selectedOption ? selectedOption.getAttribute('data-title') : "Lesson";

    const statusHeading = document.getElementById('result-status');
    if (isComplete) {
        statusHeading.innerText = "🎉 Test Complete!";
        statusHeading.style.color = "var(--char-correct)";
        
        // Only send and save records to the database if doing solo practice run
        if (activeGameMode === 'single') {
            saveScoreToDatabase(paragraphTitle, finalWpm, finalAccuracy);
        }
    } else {
        statusHeading.innerText = "⏳ Time's Up - Incomplete";
        statusHeading.style.color = "var(--char-incorrect)";
    }

    document.getElementById('modal-wpm').innerText = finalWpm + " WPM";
    document.getElementById('modal-accuracy').innerText = finalAccuracy;
    resultsModal.style.display = 'flex';
}

function saveScoreToDatabase(title, wpm, accuracy) {
    fetch('/save-score/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
        body: JSON.stringify({ paragraph_title: title, wpm: wpm, accuracy: accuracy })
    }).catch(err => console.error(err));
}

// --- ARENA LOBBY AJAX CONTROL STRATEGY MATRIX ---

function getNickname() {
    const nickname = document.getElementById('player-nickname-input').value.trim();
    if (!nickname) {
        alert("Please provide a lobby user nickname before processing execution vectors.");
        document.getElementById('player-nickname-input').focus();
        return null;
    }
    return nickname;
}

function handleCreateRoom() {
    const name = getNickname();
    if (!name) return;

    fetch('/create-room/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
        body: JSON.stringify({ username: name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            setupMultiplayerLobbyUI(data.room_code, true);
        }
    });
}

function handleJoinRoom() {
    const name = getNickname();
    if (!name) return;

    const codeInput = document.getElementById('join-code-input').value.trim().toUpperCase();
    if (!codeInput) return alert("Type the target 6-character authentication hash string to synchronize connectivity.");

    fetch('/join-room/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
        body: JSON.stringify({ code: codeInput, username: name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            setupMultiplayerLobbyUI(data.room_code, data.is_owner);
        } else {
            alert(data.message || "Lobby connection handshake rejected.");
        }
    });
}

function setupMultiplayerLobbyUI(code, isOwner) {
    trackedRoomCode = code;
    amIHost = isOwner;

    lobbySetupControls.style.display = 'none';
    currentRoomCodeTxt.innerText = code;
    lobbyActiveDashboard.style.display = 'block';

    if (amIHost) {
        lobbyInteractionPanel.innerHTML = `<button class="btn-primary" style="width:100%" onclick="fireStartChallenge()">🚀 Start Challenge</button>`;
    } else {
        lobbyInteractionPanel.innerHTML = `<span style="color:var(--text-muted); font-size:0.9rem; font-style:italic;">Awaiting match transmission initialization from host...</span>`;
    }

    pollingInterval = setInterval(pollLobbySync, 1500);
}

function pollLobbySync() {
    if (!trackedRoomCode) return;

    fetch(`/room-status/${trackedRoomCode}/`)
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            lobbyPlayersRoster.innerHTML = "";
            data.players.forEach(player => {
                const span = document.createElement('span');
                span.className = 'player-badge';
                span.innerText = `👤 ${player}`;
                lobbyPlayersRoster.appendChild(span);
            });

            if (data.is_started) {
                clearInterval(pollingInterval);
                setWorkspaceVisibility(false); // Drop the view block filter mask
                inputField.focus();
            }
        } else {
            clearInterval(pollingInterval);
            alert(data.message || "Active room session synchronization failure.");
        }
    });
}

function fireStartChallenge() {
    fetch('/start-challenge/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
        body: JSON.stringify({ code: trackedRoomCode })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== 'success') alert(data.message);
    });
}

function closeModal() {
    resultsModal.style.display = 'none';
    resetTest();
}

function resetTest() {
    clearInterval(timerInterval);
    isTestRunning = false;
    inputField.value = "";
    wpmDisplay.innerText = "0";
    accuracyDisplay.innerText = "100";
    
    const selectedTime = timeSelect.value;
    timerDisplay.innerText = selectedTime === 'none' ? "0" : selectedTime;
    
    const charSpans = targetTextDisplay.querySelectorAll('.char');
    charSpans.forEach(span => span.classList.remove('correct', 'incorrect'));
    
    if (!workspaceWrapper.classList.contains('hidden-workspace')) {
        inputField.disabled = false;
        inputField.focus();
    }
}
function handleLeaveRoom() {
    if (!trackedRoomCode) return;
    
    const name = getNickname();
    if (!name) return;

    fetch('/leave-room/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')},
        body: JSON.stringify({ code: trackedRoomCode, username: name })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            exitRoomCleanup();
        } else {
            alert(data.message || "Could not leave the room cleanly.");
        }
    })
    .catch(err => {
        console.error("Connection failed while leaving room:", err);
        // Clean up client interface anyway if server unreachable
        exitRoomCleanup();
    });
}

function exitRoomCleanup() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    
    trackedRoomCode = null;
    amIHost = false;
    
    // Clear the visual Room Code inputs
    document.getElementById('join-code-input').value = "";
    
    // Switch the UI back to Multiplayer configuration staging
    switchMode('multi'); 
    alert("You have left the multiplayer room.");
}

window.onload = init;