// Modal elemanlarını seç
const arenaModal = document.getElementById('arenaModal');
const arenaBtn = document.getElementById('arenaBtn');
const closeArena = document.getElementById('closeArena');

// 1. Arena Butonuna tıklayınca modalı aç
arenaBtn.addEventListener('click', () => {
    arenaModal.style.display = 'flex';
    // Oyunun yüklenmesi için içeriği buraya inject et
    document.getElementById('gameContainer').innerHTML = `
        <canvas id="gameCanvas" width="350" height="500" style="background:#000; border: 2px solid #0f0;"></canvas>
    `;
    // Oyunu başlat
    startGame();
});

// 2. Modalı kapat
closeArena.addEventListener('click', () => {
    arenaModal.style.display = 'none';
    document.getElementById('gameContainer').innerHTML = ''; // Kapatınca oyunu temizle
});

// 3. Basit Langırt Oyun Mantığı
function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let x = 175, y = 250, dx = 3, dy = 3;
    let paddleX = 125;

    function draw() {
        ctx.clearRect(0, 0, 350, 500);
        ctx.fillStyle = "#0f0";
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(paddleX, 480, 100, 10);
        
        x += dx; y += dy;
        if(x < 0 || x > 350) dx = -dx;
        if(y < 0) dy = -dy;
        if(y > 470 && x > paddleX && x < paddleX + 100) dy = -dy;
        if(y > 500) { x = 175; y = 250; } // Yeniden başla
        
        requestAnimationFrame(draw);
    }
    draw();
}
