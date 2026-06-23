/* ============================================================
   TTDownloader – Final JavaScript (Profil & İstatistik Dahil)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const urlInput      = document.getElementById('tiktokUrl');
  const downloadBtn   = document.getElementById('downloadBtn');
  const audioBtn      = document.getElementById('audioBtn');
  const pasteBtn      = document.getElementById('pasteBtn');
  const statusArea    = document.getElementById('statusArea');
  const homeBtn       = document.getElementById('homeBtn');
  const homeLogo      = document.getElementById('homeLogo');
  const historyBtn    = document.getElementById('historyBtn');
  const historyModal  = document.getElementById('historyModal');
  const closeHistory  = document.getElementById('closeHistory');
  const historyList   = document.getElementById('historyList');
  
  const profileBtn    = document.getElementById('profileBtn');
  const profileModal  = document.getElementById('profileModal');
  const closeProfile  = document.getElementById('closeProfile');
  const avatarInput   = document.getElementById('avatarInput');
  const profileImg    = document.getElementById('profileImg');
  const userNameInput = document.getElementById('userNameInput');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  
  const totalVideosEl = document.getElementById('totalVideos');
  const totalAudioEl  = document.getElementById('totalAudio');

  // ── Navigasyon & Modal ───────────────────────────────────
  
  function goHome() {
    urlInput.value = '';
    showStatus('idle', 'TikTok video linkini yapıştırın ve "Videoyu İndir" butonuna tıklayın.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const resultContainer = document.querySelector('.result-container');
    if (resultContainer) {
      resultContainer.style.opacity = '0';
      resultContainer.style.transform = 'translateY(10px)';
      setTimeout(() => resultContainer.remove(), 300);
    }
    if (window.location.hash) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

  homeBtn.addEventListener('click', goHome);
  homeLogo.addEventListener('click', goHome);

  historyBtn.addEventListener('click', () => {
    renderHistory();
    historyModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    initAutoplay();
  });

  closeHistory.addEventListener('click', () => {
    stopAllVideos();
    historyModal.classList.remove('open');
    document.body.style.overflow = '';
  });

  profileBtn.addEventListener('click', () => {
    loadProfile();
    updateStats();
    profileModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  closeProfile.addEventListener('click', () => {
    profileModal.classList.remove('open');
    document.body.style.overflow = '';
  });

  window.addEventListener('popstate', () => {
    if (historyModal.classList.contains('open')) closeHistory.click();
    else if (profileModal.classList.contains('open')) closeProfile.click();
    else goHome();
  });

  // ── Profil Yönetimi ──────────────────────────────────────
  
  function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('tt_profile') || '{}');
    if (profile.name) userNameInput.value = profile.name;
    if (profile.avatar) profileImg.src = profile.avatar;
    else profileImg.src = 'https://via.placeholder.com/150';
  }

  saveProfileBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) return alert('Lütfen bir isim girin.');
    
    let profile = JSON.parse(localStorage.getItem('tt_profile') || '{}');
    profile.name = name;
    localStorage.setItem('tt_profile', JSON.stringify(profile));
    alert('Profil kaydedildi!');
  });

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        profileImg.src = base64;
        let profile = JSON.parse(localStorage.getItem('tt_profile') || '{}');
        profile.avatar = base64;
        localStorage.setItem('tt_profile', JSON.stringify(profile));
      };
      reader.readAsDataURL(file);
    }
  });

  function updateStats() {
    const history = JSON.parse(localStorage.getItem('tt_history') || '[]');
    const videos = history.filter(h => h.type === 'video').length;
    const audio = history.filter(h => h.type === 'audio').length;
    
    totalVideosEl.textContent = videos;
    totalAudioEl.textContent = audio;
  }

  // ── localStorage Geçmiş Mantığı ──────────────────────────
  
  function saveToHistory(item) {
    let history = JSON.parse(localStorage.getItem('tt_history') || '[]');
    history = history.filter(h => h.downloadUrl !== item.downloadUrl);
    history.unshift({
      ...item,
      id: Date.now(),
      date: new Date().toLocaleDateString('tr-TR', { day:'numeric', month:'short' })
    });
    if (history.length > 30) history.pop();
    localStorage.setItem('tt_history', JSON.stringify(history));
  }

  function renderHistory() {
    const history = JSON.parse(localStorage.getItem('tt_history') || '[]');
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <p>Henüz indirme geçmişiniz bulunmuyor.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = history.map(item => {
      const isVideo = item.type === 'video';
      return `
        <div class="gallery-item" data-id="${item.id}">
          ${isVideo 
            ? `<video class="gallery-video" src="${item.downloadUrl}" loop playsinline muted></video>`
            : `<div class="audio-placeholder">
                 <div class="audio-disk"></div>
                 <audio class="gallery-video" src="${item.downloadUrl}" loop></audio>
                 <p>Ses Dosyası (MP3)</p>
               </div>`
          }
          <div class="gallery-info-overlay">
            <h4 class="gallery-item-title">${item.title}</h4>
            <p class="gallery-item-meta">${item.date} • ${isVideo ? 'Video' : 'Ses'}</p>
          </div>
          <div class="gallery-side-actions">
            <button class="action-btn delete-btn" onclick="deleteHistoryItem(${item.id})" title="Sil">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <a href="${item.downloadUrl}" target="_blank" class="action-btn download-btn-side" title="İndir" download>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function initAutoplay() {
    const options = { threshold: 0.6 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const media = entry.target.querySelector('video') || entry.target.querySelector('audio');
        if (entry.isIntersecting) {
          if (media) media.play().catch(e => console.log("Autoplay blocked"));
        } else {
          if (media) media.pause();
        }
      });
    }, options);
    document.querySelectorAll('.gallery-item').forEach(item => observer.observe(item));
  }

  function stopAllVideos() {
    document.querySelectorAll('.gallery-video').forEach(v => v.pause());
  }

  window.deleteHistoryItem = (id) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    let history = JSON.parse(localStorage.getItem('tt_history') || '[]');
    history = history.filter(h => h.id !== id);
    localStorage.setItem('tt_history', JSON.stringify(history));
    const item = document.querySelector(`.gallery-item[data-id="${id}"]`);
    if (item) {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      setTimeout(() => { renderHistory(); initAutoplay(); }, 300);
    }
  };

  // ── İndirme Butonları ─────────────────────────────────────
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text;
      urlInput.focus();
    } catch (e) {}
  });

  downloadBtn.addEventListener('click', () => handleDownload('video'));
  audioBtn.addEventListener('click', () => handleDownload('audio'));

  async function handleDownload(type) {
    const url = urlInput.value.trim();
    if (!url || !isTikTokUrl(url)) {
      showStatus('error', 'Lütfen geçerli bir TikTok linki girin.');
      shakeInput();
      return;
    }

    try {
      setLoading(true, type);
      showStatus('loading', `${type === 'video' ? 'Video' : 'Ses'} hazırlanıyor...`);

      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.code === 0 && result.data) {
        history.pushState({ page: 'result' }, "Result", "#result");
        const videoData = result.data;
        const title = videoData.title || 'tiktok-content';
        const downloadUrl = type === 'video' ? videoData.play : videoData.music;
        const displayTitle = type === 'video' ? title : (videoData.music_info ? videoData.music_info.title : 'TikTok Audio');

        saveToHistory({ type, title: displayTitle, cover: videoData.cover, downloadUrl: downloadUrl });
        showStatus('info', 'Başarıyla hazırlandı!');
        displayDownloadResult(type, downloadUrl, videoData.cover, displayTitle);
      } else {
        showStatus('error', 'İçerik bulunamadı.');
      }
    } catch (error) {
      showStatus('error', 'Bağlantı hatası.');
    } finally {
      setLoading(false, type);
    }
  }

  function displayDownloadResult(type, downloadUrl, coverUrl, title) {
    const isVideo = type === 'video';
    statusArea.innerHTML = `
      <div class="result-container">
        <div class="video-preview">
          <img src="${coverUrl}" class="preview-img">
          <div class="preview-overlay">
             ${isVideo ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'}
          </div>
        </div>
        <div class="result-actions">
          <p class="result-title">${title.substring(0, 40)}${title.length > 40 ? '...' : ''}</p>
          <a href="${downloadUrl}" target="_blank" class="final-download-btn ${!isVideo ? 'audio-result-btn' : ''}" download="${title}.${isVideo ? 'mp4' : 'mp3'}">
            ${isVideo ? 'Videoyu İndir' : 'MP3 Olarak İndir'}
          </a>
        </div>
      </div>
    `;
  }

  function isTikTokUrl(url) { return /tiktok\.com/i.test(url) || /vm\.tiktok\.com/i.test(url) || /vt\.tiktok\.com/i.test(url); }

  function showStatus(type, message) {
    const colors = { idle: 'rgba(255,255,255,0.38)', error: '#ff4d6d', loading: '#00f2ea', info: '#00f2ea' };
    statusArea.innerHTML = `<div style="display:flex;align-items:center;gap:7px;color:${colors[type]};font-size:0.8rem;"><span>${message}</span></div>`;
  }

  function setLoading(state, type) {
    const btn = type === 'video' ? downloadBtn : audioBtn;
    const otherBtn = type === 'video' ? audioBtn : downloadBtn;
    btn.disabled = state; otherBtn.disabled = state;
    btn.innerHTML = state ? 'İşleniyor...' : (type === 'video' ? 'Videoyu İndir' : 'Sadece Ses İndir (MP3)');
  }

  function shakeInput() {
    urlInput.style.animation = 'none';
    urlInput.offsetHeight;
    urlInput.style.animation = 'shake 0.4s ease';
  }

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answer   = btn.nextElementSibling;
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

});
