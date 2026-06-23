/* ============================================================
   TTDownloader – PRO Logic (FPS, Clock, Batch)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. FPS GÖSTERGESİ (requestAnimationFrame) ─────────────
    const fpsDisplay = document.createElement('div');
    fpsDisplay.id = 'fpsCounter';
    document.body.appendChild(fpsDisplay);

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;

    function updateFPS() {
        frameCount++;
        const now = performance.now();
        const elapsed = now - lastTime;

        if (elapsed >= 1000) {
            fps = Math.round((frameCount * 1000) / elapsed);
            fpsDisplay.innerText = `FPS: ${fps}`;
            frameCount = 0;
            lastTime = now;
        }
        requestAnimationFrame(updateFPS);
    }
    updateFPS();

    // ── 2. GÜNCEL SAAT (Opacity: 0.3) ─────────────────────────
    const clockDisplay = document.createElement('div');
    clockDisplay.id = 'digitalClock';
    document.body.appendChild(clockDisplay);

    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockDisplay.innerText = `${h}:${m}:${s}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ── 3. BATCH DOWNLOAD (Son 3 Video) ──────────────────────
    window.batchDownload = function() {
        const gecmis = JSON.parse(localStorage.getItem('m_gecmis') || '[]');
        if (gecmis.length === 0) {
            alert("Henüz geçmişte video yok!");
            return;
        }

        // Son 3 videoyu al
        const sonUc = gecmis.slice(0, 3);
        alert(`${sonUc.length} video indirme kuyruğuna alınıyor...`);

        sonUc.forEach((item, index) => {
            // Tarayıcı kısıtlamalarını aşmak için gecikmeli açıyoruz
            setTimeout(() => {
                window.open(item.url, '_blank');
            }, index * 500);
        });
    };

    // ── REELS & VİDEO MANTIĞI ─────────────────────────────────
    const reelsContainer = document.getElementById('reelsContainer');

    window.duraklat = function(id) {
        const v = document.getElementById(id);
        if (v) v.paused ? v.play() : v.pause();
    };

    window.showConfirmationBox = function(url) {
        fetchVideoAndAdd(url);
    };

    async function fetchVideoAndAdd(url) {
        try {
            const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const json = await res.json();
            if (json.code === 0) {
                const data = json.data;
                addVideoToReels(data.play, data.cover, data.title);
                
                // Geçmişe Kaydet
                let gecmis = JSON.parse(localStorage.getItem('m_gecmis') || '[]');
                gecmis.unshift({ title: data.title, url: data.play, thumb: data.cover });
                localStorage.setItem('m_gecmis', JSON.stringify(gecmis.slice(0, 50)));
            }
        } catch (e) { console.error(e); }
    }

    function addVideoToReels(videoUrl, cover, title) {
        const id = 'v_' + Date.now();
        const section = document.createElement('section');
        section.className = 'video-section';
        section.innerHTML = `
            <video id="${id}" src="${videoUrl}" loop playsinline onclick="duraklat('${id}')"></video>
            <div style="position: absolute; bottom: 80px; left: 20px; text-shadow: 2px 2px 4px #000; pointer-events:none;">
                <p style="font-weight: bold; color:#00f2ea;">@TTDownloader PRO</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">${title}</p>
            </div>
        `;
        reelsContainer.prepend(section);
        document.getElementById(id).play();
    }
});
