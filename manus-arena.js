// ============================================================
//  MANUS ARENA & MUSIC MODULE (v3.0 Final)
//  Package: com.manus.v2
//  Features: Neon Arena, Offline Music, Desktop UA Sync
// ============================================================

(function () {
  'use strict';

  // --- GLOBAL STATE ---
  let canvas, ctx, animId = null, gameRunning = false, gamePaused = false;
  let score = 0, highScore = parseInt(localStorage.getItem('manusArenaHigh') || '0');
  const ball = { x: 0, y: 0, vx: 0, vy: 0, r: 12 };
  const paddle = { x: 0, y: 0, w: 110, h: 14, color: '#ff0033' };
  let speedMult = 1;
  const BASE_SPEED = 5;

  // --- MUSIC STATE ---
  let audioPlayer = new Audio();
  let playlist = JSON.parse(localStorage.getItem('manusPlaylist') || '[]');

  // --- UI BUILDER ---
  function buildAllUI() {
    if (document.getElementById('manusArenaOverlay')) return;

    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    // Arena Button
    const arenaBtn = document.createElement('button');
    arenaBtn.className = 'nav-icon-btn';
    arenaBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg><span>Arena</span>`;
    arenaBtn.onclick = openArena;
    headerActions.prepend(arenaBtn);

    // Music Button
    const musicBtn = document.createElement('button');
    musicBtn.className = 'nav-icon-btn';
    musicBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg><span>Müzik</span>`;
    musicBtn.onclick = openMusic;
    headerActions.appendChild(musicBtn);

    // --- OVERLAYS ---
    const arenaOverlay = document.createElement('div');
    arenaOverlay.id = 'manusArenaOverlay';
    arenaOverlay.style.cssText = `display:none; position:fixed; inset:0; z-index:9999; background:#000; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;`;
    arenaOverlay.innerHTML = `
      <div style="text-align:center; margin-bottom:10px;"><div style="color:#fff; font-size:24px; font-weight:800;">MANUS ARENA</div></div>
      <div style="display:flex; gap:20px; color:#fff; margin-bottom:10px;"><div>GÜÇ: <span id="arenaScore">0</span></div><div>EN YÜKSEK: ${highScore}</div></div>
      <canvas id="arenaCanvas" style="border:1px solid #222; border-radius:8px; touch-action:none;"></canvas>
      <button id="arenaPauseBtn" style="margin-top:15px; padding:12px 40px; background:#ff0033; color:#fff; border:none; border-radius:8px; font-weight:700;">⏸ DURAKLAT</button>
      <button onclick="document.getElementById('manusArenaOverlay').style.display='none'; stopGame();" style="position:absolute; top:20px; right:20px; color:#555; background:none; border:none; font-size:30px;">&times;</button>
      <div id="arenaGameOver" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.9); flex-direction:column; align-items:center; justify-content:center;">
        <div style="color:#ff0033; font-size:20px; margin-bottom:10px;">⚠ SİSTEM HATASI</div>
        <button onclick="startGame()" style="padding:10px 30px; background:#fff; border:none; border-radius:5px; font-weight:800;">YENİDEN BAŞLAT</button>
      </div>`;
    document.body.appendChild(arenaOverlay);

    const musicOverlay = document.createElement('div');
    musicOverlay.id = 'manusMusicOverlay';
    musicOverlay.style.cssText = `display:none; position:fixed; inset:0; z-index:9998; background:#0a0a0a; flex-direction:column; padding:20px; color:#fff; font-family:sans-serif;`;
    musicOverlay.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2>KÜTÜPHANE</h2><button onclick="document.getElementById('manusMusicOverlay').style.display='none'" style="color:#555; background:none; border:none; font-size:30px;">&times;</button></div>
      <div id="musicList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;"></div>
      <div id="playerBar" style="background:#111; padding:15px; border-radius:10px; display:none;">
        <div id="nowPlaying" style="color:#00f2ea; margin-bottom:10px;">Oynatılıyor...</div>
        <div style="display:flex; justify-content:center; gap:30px;"><button id="playPause" style="width:50px; height:50px; border-radius:50%; border:none; background:#fff; font-size:20px;">▶</button></div>
      </div>`;
    document.body.appendChild(musicOverlay);

    // Events
    document.getElementById('arenaPauseBtn').onclick = togglePause;
    document.getElementById('playPause').onclick = () => {
      if (audioPlayer.paused) { audioPlayer.play(); document.getElementById('playPause').textContent = '⏸'; }
      else { audioPlayer.pause(); document.getElementById('playPause').textContent = '▶'; }
    };
  }

  // --- ARENA LOGIC ---
  function openArena() { document.getElementById('manusArenaOverlay').style.display = 'flex'; setupCanvas(); startGame(); }
  function setupCanvas() { canvas = document.getElementById('arenaCanvas'); ctx = canvas.getContext('2d'); canvas.width = Math.min(window.innerWidth - 40, 400); canvas.height = 500; paddle.y = 470; paddle.x = 150; canvas.addEventListener('mousemove', e => { paddle.x = e.offsetX - paddle.w/2; }); canvas.addEventListener('touchmove', e => { e.preventDefault(); paddle.x = e.touches[0].clientX - canvas.getBoundingClientRect().left - paddle.w/2; }, {passive:false}); }
  function startGame() { score = 0; speedMult = 1; gameRunning = true; gamePaused = false; document.getElementById('arenaGameOver').style.display = 'none'; resetBall(); gameLoop(); }
  function stopGame() { gameRunning = false; cancelAnimationFrame(animId); }
  function resetBall() { ball.x = 200; ball.y = 100; ball.vx = 4; ball.vy = 4; }
  function togglePause() { gamePaused = !gamePaused; if(!gamePaused) gameLoop(); document.getElementById('arenaPauseBtn').textContent = gamePaused ? '▶ DEVAM' : '⏸ DURAKLAT'; }
  function gameLoop() { if(!gameRunning || gamePaused) return; update(); draw(); animId = requestAnimationFrame(gameLoop); }
  function update() { ball.x += ball.vx * speedMult; ball.y += ball.vy * speedMult; if(ball.x<=0 || ball.x>=canvas.width) ball.vx *= -1; if(ball.y<=0) ball.vy *= -1; if(ball.y>=paddle.y && ball.x>=paddle.x && ball.x<=paddle.x+paddle.w) { ball.vy *= -1; score++; speedMult += 0.05; document.getElementById('arenaScore').textContent = score; } if(ball.y>canvas.height) { document.getElementById('arenaGameOver').style.display = 'flex'; gameRunning = false; } }
  function draw() { ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle = '#ff0033'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h); ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill(); }

  // --- MUSIC LOGIC ---
  function openMusic() { document.getElementById('manusMusicOverlay').style.display = 'flex'; renderPlaylist(); }
  function renderPlaylist() {
    const list = document.getElementById('musicList');
    list.innerHTML = playlist.length ? '' : '<div style="text-align:center; color:#444;">Boş.</div>';
    playlist.forEach((t, i) => {
      const item = document.createElement('div');
      item.style.cssText = 'background:#1a1a1a; padding:15px; border-radius:8px; display:flex; justify-content:space-between;';
      item.innerHTML = `<span>${t.title}</span><button onclick="playTrack(${i})" style="background:#00f2ea; border:none; border-radius:4px; padding:5px 10px;">OYNAT</button>`;
      list.appendChild(item);
    });
  }
  window.playTrack = (i) => { audioPlayer.src = playlist[i].url; audioPlayer.play(); document.getElementById('playerBar').style.display = 'block'; document.getElementById('nowPlaying').textContent = playlist[i].title; document.getElementById('playPause').textContent = '⏸'; };

  // --- INIT ---
  function init() { buildAllUI(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
