/* ============================================================
   TTDownloader – Remote-Update app.js
   Bu dosya Netlify üzerinde tutulur ve APK tarafından her açılışta yüklenir.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementleri
    const urlInput = document.getElementById('tiktokUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const audioBtn = document.getElementById('audioBtn');
    const statusArea = document.getElementById('statusArea');

    // ── 1. NATIVE BRIDGE (MainActivity.kt'den çağrılır) ────────
    window.showConfirmationBox = function(capturedUrl) {
        if (!capturedUrl) return;
        
        // Linki inputa yaz
        if (urlInput) urlInput.value = capturedUrl;
        
        // Kuru Kafa Onay Kutusunu Göster
        showSkullPopup(capturedUrl);
    };

    // ── 2. KURU KAFA POP-UP (UI) ──────────────────────────────
    function showSkullPopup(url) {
        // Varsa eskiyi temizle
        const old = document.getElementById('skullOverlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'skullOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.96); display: flex; align-items: center; justify-content: center;
            z-index: 20000; font-family: 'Inter', sans-serif; animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="width: 320px; padding: 30px; background: #000; border: 4px solid #ff0050; border-radius: 24px; text-align: center; box-shadow: 0 0 60px rgba(255, 0, 80, 0.7); color: #fff;">
                <div style="font-size: 60px; margin-bottom: 15px; filter: drop-shadow(0 0 15px #ff0050);">💀</div>
                <h3 style="color: #ff0050; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 4px; font-weight: 900;">LİNK BULUNDU</h3>
                <p style="font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-bottom: 20px; word-break: break-all;">${url.substring(0, 50)}...</p>
                <div id="skullTimer" style="font-size: 50px; color: #fff; font-weight: 900; margin-bottom: 25px; text-shadow: 0 0 20px #ff0050;">3</div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button id="skullYes" style="background: #ff0050; color: #fff; border: none; padding: 16px; border-radius: 14px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">EVET (İNDİR)</button>
                    <button id="skullNo" style="background: transparent; color: #ff0050; border: 2px solid #ff0050; padding: 14px; border-radius: 14px; font-weight: bold; cursor: pointer; text-transform: uppercase;">HAYIR (İPTAL)</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);

        // Sayaç Mantığı
        let timeLeft = 3;
        const timerEl = document.getElementById('skullTimer');
        const interval = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.innerText = timeLeft;
            if (timeLeft <= 0) clearInterval(interval);
        }, 1000);

        // Buton Aksiyonları
        document.getElementById('skullYes').onclick = () => {
            clearInterval(interval);
            overlay.remove();
            handleDownload('video'); // Otomatik indir
        };

        document.getElementById('skullNo').onclick = () => {
            clearInterval(interval);
            overlay.remove();
        };
    }

    // ── 3. İNDİRME MANTIĞI ────────────────────────────────────
    async function handleDownload(type) {
        const url = urlInput.value.trim();
        if (!url) return;

        try {
            updateStatus('loading', 'Hazırlanıyor...');
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const result = await response.json();

            if (result.code === 0 && result.data) {
                const dUrl = type === 'video' ? result.data.play : result.data.music;
                updateStatus('info', 'Hazır!');
                // Sonuç arayüzünü göster
                renderResult(type, dUrl, result.data.cover, result.data.title || 'TikTok');
            } else {
                updateStatus('error', 'Bulunamadı.');
            }
        } catch (e) {
            updateStatus('error', 'Hata oluştu.');
        }
    }

    function renderResult(type, dlUrl, cover, title) {
        if (!statusArea) return;
        statusArea.innerHTML = `
            <div style="margin-top: 20px; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 18px; border: 1px solid #ff0050;">
                <img src="${cover}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 12px; margin-bottom: 10px;">
                <a href="${dlUrl}" target="_blank" style="display: block; background: #ff0050; color: #fff; text-align: center; padding: 12px; border-radius: 10px; font-weight: bold; text-decoration: none; text-transform: uppercase;">
                    ${type === 'video' ? 'VİDEOYU İNDİR' : 'MP3 İNDİR'}
                </a>
            </div>
        `;
    }

    function updateStatus(type, msg) {
        if (statusArea) statusArea.innerHTML = `<p style="color: #00f2ea; font-size: 0.8rem; text-align: center;">${msg}</p>`;
    }

    // Event Listeners
    if (downloadBtn) downloadBtn.onclick = () => handleDownload('video');
    if (audioBtn) audioBtn.onclick = () => handleDownload('audio');
});

// CSS Animasyon
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    #skullOverlay * { transition: all 0.2s ease; }
    #skullYes:active { transform: scale(0.95); background: #cc0040; }
    #skullNo:active { transform: scale(0.95); background: rgba(255,0,80,0.1); }
`;
document.head.appendChild(style);
