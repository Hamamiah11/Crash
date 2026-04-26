const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let balance = 100, multiplier = 1.0, bet = 0, crashAt = 0;
let gameRunning = false, userInGame = false, points = [];
let gameTick;

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.onresize = resize;
resize();

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = gameRunning ? (userInGame ? "#00ff88" : "#8b949e") : "#ff4757";
    ctx.lineWidth = 5;
    ctx.beginPath();
    
    points.forEach((p, i) => {
        const x = (i / 500) * canvas.width;
        const y = canvas.height - (Math.pow(p, 1.3) * 50);
        if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (points.length > 0) {
        const lastX = ((points.length-1) / 500) * canvas.width;
        const lastY = canvas.height - (Math.pow(points[points.length-1], 1.3) * 50);
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(lastX, lastY, 6, 0, Math.PI * 2); ctx.fill();
    }
    if (gameRunning) requestAnimationFrame(drawGame);
}

function startGame() {
    if(gameRunning) return;
    bet = parseFloat(document.getElementById('bet-amt').value);
    if (bet > balance || bet <= 0) return alert("Invalid bet!");
    
    balance -= bet;
    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
    
    // 10% chance of an early drop (1.0 - 1.5x), else normal math capped at 100x
    const isDrop = Math.random() < 0.10;
    let rawCrash = isDrop ? (1.0 + Math.random() * 0.5) : (0.98 / (1 - Math.random()));
    crashAt = Math.min(100, Math.max(1.01, rawCrash));

    gameRunning = true;
    userInGame = true;
    multiplier = 1.0;
    points = [1.0];
    
    document.getElementById('bet-btn').style.display = "none";
    document.getElementById('cash-btn').style.display = "block";
    document.getElementById('mult-display').style.color = "var(--neon)";

    gameTick = setInterval(() => {
        multiplier += 0.01;
        points.push(multiplier);
        document.getElementById('mult-display').innerText = multiplier.toFixed(2) + "x";

        if (multiplier >= crashAt) {
            finishRound();
        }
    }, 50);
    drawGame();
}

function cashOut() {
    if (!userInGame) return;
    balance += (bet * multiplier);
    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
    userInGame = false;
    document.getElementById('cash-btn').style.display = "none";
    document.getElementById('mult-display').style.color = "#8b949e";
}

function finishRound() {
    clearInterval(gameTick);
    gameRunning = false;
    userInGame = false;
    document.getElementById('mult-display').style.color = "var(--danger)";
    document.getElementById('last-crash').innerText = multiplier.toFixed(2) + "x";
    document.getElementById('bet-btn').style.display = "block";
    document.getElementById('cash-btn').style.display = "none";
}
