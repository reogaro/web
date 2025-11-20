// Privacy-respecting YouTube Embeds 

(function () {
  const ensureStyle = () => {
    if (document.getElementById('youtube-privacy-spinner-style')) return;
    const s = document.createElement('style');
    s.id = 'youtube-privacy-spinner-style';
    s.textContent = `
      @keyframes ytp-spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
      .youtube-privacy-loader{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:48px; height:48px; border-radius:50%; border:4px solid rgba(255,255,255,0.6); border-top-color:#fff; z-index:2; animation:ytp-spin 1s linear infinite; }
      .youtube-privacy-error{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)); z-index:3; padding:1rem; box-sizing:border-box; text-align:center; }
      .youtube-privacy-error a{ background:#FFFFFF); color:#0A0A0A; padding:0.5rem 0.75rem; border-radius:2px; text-decoration:none }
    `;
    document.head.appendChild(s);
  };

  const safeRemove = n => { if (!n) return; if (n.remove) n.remove(); else if (n.parentNode) n.parentNode.removeChild(n); };

  const sanitizeId = raw => {
    if (!raw) return '';
    raw = String(raw).trim();
    // Validation using regex from:
    // https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video#101153
    const m = raw.match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/);
    return (m ? m[0] : raw).replace(/[^A-Za-z0-9_-]/g, '');
  };

  const makeError = id => {
    const o = document.createElement('div'); o.className = 'youtube-privacy-error';
    const a = document.createElement('a'); a.href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = 'Failed to load. Click to open on YouTube';
    o.appendChild(a);
    return o;
  };

  const replaceWithYouTubeIframe = el => {
    let id = el.dataset.youtubeId || '';
    id = sanitizeId(id);
    if (!id) { console.error('Video ID missing or invalid:', el); return; }
    if (el.dataset) el.dataset.youtubeId = id;
    if (!el.parentNode) { console.error('Parent missing for:', el); return; }

    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.background = 'none';

    ensureStyle();
    const svg = el.querySelector('svg'); if (svg) { svg.style.transition = 'opacity .15s ease'; svg.style.opacity = '0'; }

    const loader = document.createElement('div'); loader.className = 'youtube-privacy-loader'; el.appendChild(loader);
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    iframe.title = 'YouTube video player';
    iframe.allowFullscreen = true;
    Object.assign(iframe.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0', display: 'block' });

    let errorOverlay = null;
    const showError = () => {
      safeRemove(loader); safeRemove(svg);
      if (!errorOverlay) { errorOverlay = makeError(id); el.appendChild(errorOverlay); }
    };

    const timeout = setTimeout(showError, 10000);
    iframe.addEventListener('load', () => { clearTimeout(timeout); safeRemove(loader); safeRemove(svg); }, { once: true });
    iframe.addEventListener('error', () => { clearTimeout(timeout); showError(); }, { once: true });

    el.appendChild(iframe);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.youtube-preview-privacy').forEach(el => {
      if ((!el.dataset || !el.dataset.youtubeId) && el.id) { if (el.dataset) el.dataset.youtubeId = el.id; }
      el.addEventListener('click', e => { e.preventDefault(); replaceWithYouTubeIframe(el); }, { once: true });
    });
  });
})();

