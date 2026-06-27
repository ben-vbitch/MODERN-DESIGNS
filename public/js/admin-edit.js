console.log("✅ admin-edit.js loaded");
(function () {
  'use strict';

  const TOKEN_KEY = 'mdb_token';
  const token     = localStorage.getItem(TOKEN_KEY);

  function getPageName() {
    const p = window.location.pathname.replace(/\/$/, '');
    if (p.includes('/public/villa'))      return 'villa';
    if (p.includes('/public/interiors'))  return 'interiors';
    if (p.includes('/public/mhome'))      return 'mhome';
    if (p.includes('/public/tradition'))  return 'tradition';
    return 'index';
  }

  const PAGE = getPageName();
  console.log("Current pathname:", window.location.pathname);
  console.log("Detected PAGE:", PAGE);

  function authHeaders(extra = {}) {
    return { 'Authorization': 'Bearer ' + token, ...extra };
  }

  let toastTimer;
  function toast(msg, type = 'ok') {
    let t = document.getElementById('__mdb_toast');
    if (!t) {
      t = document.createElement('div');
      t.id = '__mdb_toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      Object.assign(t.style, {
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999,
        padding: '11px 20px', fontFamily: 'DM Sans,sans-serif',
        fontSize: '13px', fontWeight: '500',
        transition: 'opacity .3s,transform .3s',
        opacity: '0', transform: 'translateY(8px)',
        pointerEvents: 'none', borderRadius: '4px',
      });
      document.body.appendChild(t);
    }
    clearTimeout(toastTimer);
    t.textContent = (type === 'ok' ? '✓ ' : '✕ ') + msg;
    t.style.background = type === 'ok' ? 'rgba(110,231,183,.15)' : 'rgba(248,113,113,.15)';
    t.style.border     = type === 'ok' ? '1px solid rgba(110,231,183,.35)' : '1px solid rgba(248,113,113,.35)';
    t.style.color      = type === 'ok' ? '#6ee7b7' : '#f87171';
    t.style.opacity    = '1';
    t.style.transform  = 'translateY(0)';
    toastTimer = setTimeout(() => {
      t.style.opacity   = '0';
      t.style.transform = 'translateY(8px)';
    }, 3200);
  }

  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      #__mdb_adminbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 99990;
        background: rgba(7,7,7,.95);
        border-bottom: 1px solid rgba(201,168,76,.3);
        padding: 7px 20px;
        display: flex; align-items: center; justify-content: space-between;
        font-family: 'DM Sans',sans-serif; font-size: 12px;
        backdrop-filter: blur(10px);
      }
      #__mdb_adminbar .ab-left {
        display: flex; align-items: center; gap: 10px;
        color: rgba(244,241,236,.6);
      }
      #__mdb_adminbar .ab-dot {
        width: 7px; height: 7px; background: #6ee7b7; border-radius: 50%;
        animation: __mdb_pulse 2s infinite;
      }
      @keyframes __mdb_pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      #__mdb_adminbar .ab-page {
        background: rgba(201,168,76,.15); border: 1px solid rgba(201,168,76,.3);
        color: #C9A84C; padding: 2px 9px; font-size: 10px;
        letter-spacing: 1.5px; text-transform: uppercase;
      }
      #__mdb_adminbar button {
        background: none; border: 1px solid rgba(255,255,255,.15);
        color: rgba(244,241,236,.7); padding: 5px 13px;
        font-family: 'DM Sans',sans-serif; font-size: 11px;
        cursor: pointer; letter-spacing: 1px; text-transform: uppercase;
        transition: border-color .2s, color .2s;
      }
      #__mdb_adminbar button:hover { border-color: #f87171; color: #f87171; }
      #__mdb_adminbar .ab-right { display: flex; gap: 8px; align-items: center; }

      [data-editable]:hover { outline: 2px dashed rgba(201,168,76,.7) !important; outline-offset: 3px !important; cursor: pointer !important; }

      .__mdb_toolbar {
        position: fixed; z-index: 99980;
        display: flex; gap: 4px;
        background: rgba(7,7,7,.95); border: 1px solid rgba(201,168,76,.4);
        padding: 4px 6px; pointer-events: all; white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0,0,0,.5);
      }
      .__mdb_toolbar button {
        background: none; border: 1px solid rgba(255,255,255,.1);
        color: rgba(244,241,236,.8); padding: 3px 10px;
        font-family: 'DM Sans',sans-serif; font-size: 10px;
        letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all .2s;
      }
      .__mdb_toolbar button:hover { border-color: #C9A84C; color: #C9A84C; }
      .__mdb_toolbar button.danger:hover { border-color: #f87171; color: #f87171; }

      .__mdb_editor_wrap {
        position: fixed; inset: 0; z-index: 99995;
        background: rgba(0,0,0,.75); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; padding: 20px;
      }
      .__mdb_editor_box {
        background: #141414; border: 1px solid rgba(201,168,76,.3);
        width: 100%; max-width: 640px; position: relative;
      }
      .__mdb_editor_box::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0;
        height: 2px; background: linear-gradient(90deg,#C9A84C,#B87333);
      }
      .__mdb_editor_head {
        padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,.07);
        display: flex; align-items: center; justify-content: space-between;
        font-family: 'DM Sans',sans-serif; font-size: 13px; font-weight: 600;
        color: rgba(244,241,236,.9);
      }
      .__mdb_editor_head button { background: none; border: none; color: #555; font-size: 18px; cursor: pointer; line-height: 1; padding: 2px 6px; }
      .__mdb_editor_head button:hover { color: #F4F1EC; }
      .__mdb_editor_body { padding: 18px; }
      .__mdb_editor_body textarea {
        width: 100%; min-height: 110px; resize: vertical;
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.09);
        color: #F4F1EC; font-family: 'DM Sans',sans-serif; font-size: 14px;
        padding: 12px 14px; outline: none; line-height: 1.6;
        transition: border-color .25s; box-sizing: border-box;
      }
      .__mdb_editor_body textarea:focus { border-color: #C9A84C; }
      .__mdb_editor_foot {
        padding: 12px 18px; border-top: 1px solid rgba(255,255,255,.07);
        display: flex; justify-content: flex-end; gap: 10px;
      }
      .__mdb_editor_foot button {
        padding: 9px 20px; font-family: 'DM Sans',sans-serif;
        font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
        text-transform: uppercase; border: none; cursor: pointer; transition: all .2s;
      }
      .__mdb_editor_foot .save { background: #C9A84C; color: #070707; }
      .__mdb_editor_foot .save:hover { background: #E2C46A; }
      .__mdb_editor_foot .cancel { background: transparent; color: rgba(244,241,236,.5); border: 1px solid rgba(255,255,255,.1); }
      .__mdb_editor_foot .cancel:hover { border-color: #f87171; color: #f87171; }

      .__mdb_upload_bar {
        position: fixed; top: 40px; left: 0; right: 0; height: 3px;
        z-index: 99998; background: rgba(255,255,255,.05); display: none;
      }
      .__mdb_upload_bar_inner { height: 100%; background: #C9A84C; width: 0; transition: width .3s; }

      /* Hit area badge shown while hovering over an editable image */
      .__mdb_img_badge {
        position: fixed; z-index: 99975;
        background: rgba(201,168,76,.92); color: #070707;
        font-family: 'DM Sans',sans-serif; font-size: 10px;
        font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
        padding: 4px 10px; pointer-events: none;
        white-space: nowrap;
      }

      /* Click-to-open image action panel */
      .__mdb_img_panel {
        position: fixed; z-index: 99985;
        background: rgba(7,7,7,.97); border: 1px solid rgba(201,168,76,.5);
        box-shadow: 0 8px 32px rgba(0,0,0,.7);
        min-width: 200px; pointer-events: all;
      }
      .__mdb_img_panel::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0;
        height: 2px; background: linear-gradient(90deg,#C9A84C,#B87333);
      }
      .__mdb_img_panel_head {
        padding: 10px 14px 8px;
        display: flex; align-items: center; justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,.06);
      }
      .__mdb_img_panel_head .ph-key {
        font-family: 'DM Sans',sans-serif; font-size: 10px;
        color: #C9A84C; font-weight: 600; letter-spacing: 1px;
        max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .__mdb_img_panel_head .ph-close {
        background: none; border: none; color: rgba(244,241,236,.4);
        font-size: 15px; cursor: pointer; line-height: 1; padding: 0 2px;
        font-family: monospace;
      }
      .__mdb_img_panel_head .ph-close:hover { color: #f87171; }
      .__mdb_img_panel_btns {
        display: flex; flex-direction: column; gap: 0;
      }
      .__mdb_img_panel_btns button {
        background: none; border: none; border-bottom: 1px solid rgba(255,255,255,.05);
        color: rgba(244,241,236,.8); padding: 10px 14px;
        font-family: 'DM Sans',sans-serif; font-size: 11px;
        letter-spacing: 1px; text-transform: uppercase;
        cursor: pointer; text-align: left;
        transition: background .15s, color .15s;
        display: flex; align-items: center; gap: 8px;
      }
      .__mdb_img_panel_btns button:last-child { border-bottom: none; }
      .__mdb_img_panel_btns button:hover { background: rgba(255,255,255,.04); color: #C9A84C; }
      .__mdb_img_panel_btns button.danger:hover { color: #f87171; }
    `;
    document.head.appendChild(s);
  }

  const _origText = {};
  const _origSrc  = {};

  function snapshotOriginals() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      _origText[el.dataset.editable] = el.innerHTML;
    });
    document.querySelectorAll('[data-editable-img]').forEach(el => {
      _origSrc[el.dataset.editableImg] = el.src;
    });
  }

  async function applyContent() {
    console.log("Fetching:", "/api/content/" + PAGE);
    try {
      const res  = await fetch('/api/content/' + PAGE);
      if (!res.ok) return;
      const data = await res.json();
      console.log("Database content:", data);
      Object.entries(data).forEach(([key, { type, value }]) => {
        if (type === 'text') {
          const el = document.querySelector(`[data-editable="${key}"]`);
          if (el) el.innerHTML = value;
        } else if (type === 'image') {
          const el = document.querySelector(`[data-editable-img="${key}"]`);
          if (el && el.tagName === 'IMG') el.src = value;
        }
      });
    } catch (e) {
      console.warn('[MDB Admin] Could not load content overrides:', e);
    }
  }

  function injectAdminBar() {
    const bar = document.createElement('div');
    bar.id = '__mdb_adminbar';
    bar.innerHTML = `
      <div class="ab-left">
        <div class="ab-dot"></div>
        Admin Mode
        <span class="ab-page">${PAGE}</span>
      </div>
      <div class="ab-right">
        <button id="__mdb_logout">Sign Out</button>
      </div>`;
    document.body.prepend(bar);
    const nav = document.getElementById('nav');
    if (nav) nav.style.top = bar.offsetHeight + 'px';
    document.getElementById('__mdb_logout').addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      location.reload();
    });
  }

  function injectProgressBar() {
    const bar = document.createElement('div');
    bar.className = '__mdb_upload_bar';
    bar.id = '__mdb_upbar';
    bar.innerHTML = '<div class="__mdb_upload_bar_inner" id="__mdb_upinner"></div>';
    document.body.appendChild(bar);
  }

  function setProgress(pct) {
    const bar   = document.getElementById('__mdb_upbar');
    const inner = document.getElementById('__mdb_upinner');
    if (!bar || !inner) return;
    bar.style.display = pct >= 100 ? 'none' : 'block';
    inner.style.width = pct + '%';
  }

  function openTextEditor(el, key) {
    const wrap = document.createElement('div');
    wrap.className = '__mdb_editor_wrap';
    wrap.innerHTML = `
      <div class="__mdb_editor_box">
        <div class="__mdb_editor_head">
          Edit: <em style="color:#C9A84C;font-style:normal">${key}</em>
          <button id="__mdb_eclose">×</button>
        </div>
        <div class="__mdb_editor_body">
          <textarea id="__mdb_etxt"></textarea>
          <p style="margin-top:8px;font-size:11px;color:#444;font-family:'DM Sans',sans-serif">HTML allowed (e.g. &lt;em&gt;, &lt;br&gt;, &lt;strong&gt;)</p>
        </div>
        <div class="__mdb_editor_foot">
          <button class="cancel" id="__mdb_ecancel">Cancel</button>
          <button class="save"   id="__mdb_esave">Save Changes</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    document.getElementById('__mdb_etxt').value = el.innerHTML;

    const close = () => wrap.remove();
    document.getElementById('__mdb_eclose').addEventListener('click', close);
    document.getElementById('__mdb_ecancel').addEventListener('click', close);
    wrap.addEventListener('click', e => { if (e.target === wrap) close(); });

    document.getElementById('__mdb_esave').addEventListener('click', async () => {
      const value = document.getElementById('__mdb_etxt').value;
      const btn   = document.getElementById('__mdb_esave');
      btn.disabled = true; btn.textContent = 'Saving…';
      try {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ page: PAGE, section: key, type: 'text', value }),
        });
        if (!res.ok) throw new Error('Save failed');
        el.innerHTML = value;
        toast('Text saved');
        close();
      } catch (err) {
        toast(err.message, 'err');
        btn.disabled = false; btn.textContent = 'Save Changes';
      }
    });

    setTimeout(() => document.getElementById('__mdb_etxt').focus(), 50);
  }

  function triggerImageUpload(imgEl, key) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) { input.remove(); return; }
      if (file.size > 10 * 1024 * 1024) {
        toast('File too large (max 10 MB)', 'err');
        input.remove(); return;
      }

      const fd = new FormData();
      fd.append('image', file);
      fd.append('page', PAGE);
      fd.append('section', key);

      setProgress(10);
      try {
        const url = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload');
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
          xhr.upload.addEventListener('progress', e => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90));
          });
          xhr.addEventListener('load', () => {
            try {
              const data = JSON.parse(xhr.responseText);
              if (xhr.status >= 400) reject(new Error(data.error || 'Upload failed (' + xhr.status + ')'));
              else {
                const imageUrl = data.url || data.secure_url;
                if (!imageUrl) reject(new Error('Server returned no URL'));
                else resolve(imageUrl);
              }
            } catch { reject(new Error('Upload failed — invalid server response')); }
          });
          xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
          xhr.send(fd);
        });
        setProgress(100);
        imgEl.src = url;
        toast('Image updated');
      } catch (err) {
        setProgress(100);
        toast(err.message, 'err');
      } finally {
        input.remove();
      }
    });

    input.click();
  }

  async function resetSection(key, isImg) {
    if (!confirm(`Reset "${key}" to original? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/content', {
        method: 'DELETE',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ page: PAGE, section: key }),
      });
      if (!res.ok) throw new Error('Reset failed');
      if (isImg) {
        const el = document.querySelector(`[data-editable-img="${key}"]`);
        if (el) el.src = _origSrc[key] || '';
      } else {
        const el = document.querySelector(`[data-editable="${key}"]`);
        if (el) el.innerHTML = _origText[key] || '';
      }
      toast('Reset to original');
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  /* ── TEXT toolbar ── */
  function createToolbar(el, key) {
    const toolbar = document.createElement('div');
    toolbar.className = '__mdb_toolbar';
    toolbar.innerHTML = `<button class="edit-btn">✏ Edit</button><button class="danger reset-btn">↺ Reset</button>`;
    document.body.appendChild(toolbar);

    const rect = el.getBoundingClientRect();
    toolbar.style.top  = (rect.top - toolbar.offsetHeight - 6) + 'px';
    toolbar.style.left = rect.left + 'px';

    toolbar.querySelector('.edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      openTextEditor(el, key);
    });
    toolbar.querySelector('.reset-btn').addEventListener('click', e => {
      e.stopPropagation();
      resetSection(key, false);
    });
    return toolbar;
  }

  /* ══════════════════════════════════════════════
     IMAGE EDITING — click-to-open panel model.

     A transparent fixed hit area is laid over each
     editable image, sized/positioned via
     getBoundingClientRect() AFTER window load so
     images that are in the viewport (hero) have
     their real dimensions.

     Clicking anywhere on the hit area opens a small
     action panel with Upload + Reset. No hover magic
     needed — reliable for hero images under overlays,
     canvas, veil divs, etc.
  ══════════════════════════════════════════════ */
  function activateEditables() {

    /* TEXT */
    document.querySelectorAll('[data-editable]').forEach(el => {
      const key = el.dataset.editable;
      let toolbar = null;

      el.addEventListener('mouseenter', () => {
        if (toolbar) return;
        toolbar = createToolbar(el, key);
      });
      el.addEventListener('mouseleave', e => {
        if (toolbar && !toolbar.contains(e.relatedTarget)) {
          toolbar.remove(); toolbar = null;
        }
      });
    });

    /* IMAGES */
    document.querySelectorAll('[data-editable-img]').forEach(imgEl => {
      const key = imgEl.dataset.editableImg;

      /* ── Hit area: transparent fixed div on top of everything ── */
      const hitArea = document.createElement('div');
      hitArea.style.cssText = `
        position: fixed; z-index: 99970;
        cursor: pointer; background: transparent; pointer-events: all;
        box-sizing: border-box;
      `;
      document.body.appendChild(hitArea);

      /* ── Hover badge: "📷 key" label at top-left of image ── */
      const badge = document.createElement('div');
      badge.className = '__mdb_img_badge';
      badge.textContent = '📷  ' + key;
      badge.style.display = 'none';
      document.body.appendChild(badge);

      /* ── Active panel: click-opened, has Upload + Reset ── */
      let activePanel = null;

      function closePanel() {
        if (activePanel) { activePanel.remove(); activePanel = null; }
      }

      function openPanel() {
        closePanel();

        const panel = document.createElement('div');
        panel.className = '__mdb_img_panel';
        panel.innerHTML = `
          <div class="__mdb_img_panel_head">
            <span class="ph-key">📷  ${key}</span>
            <button class="ph-close">×</button>
          </div>
          <div class="__mdb_img_panel_btns">
            <button class="upload-btn">⬆ Upload New Image</button>
            <button class="reset-btn danger">↺ Reset to Original</button>
          </div>`;
        document.body.appendChild(panel);
        activePanel = panel;

        /* Position: top-left corner of the image, or below if no room above */
        function posPanel() {
          const r  = imgEl.getBoundingClientRect();
          const pw = panel.offsetWidth  || 200;
          const ph = panel.offsetHeight || 100;
          let top  = r.top + 4;
          let left = r.left + 4;
          if (top + ph > window.innerHeight - 8) top = r.bottom - ph - 4;
          if (left + pw > window.innerWidth  - 8) left = r.right - pw - 4;
          if (top  < 44) top  = 44;
          if (left < 4)  left = 4;
          panel.style.top  = top  + 'px';
          panel.style.left = left + 'px';
        }
        posPanel();

        panel.querySelector('.ph-close').addEventListener('click', e => {
          e.stopPropagation(); closePanel();
        });
        panel.querySelector('.upload-btn').addEventListener('click', e => {
          e.stopPropagation(); closePanel();
          triggerImageUpload(imgEl, key);
        });
        panel.querySelector('.reset-btn').addEventListener('click', e => {
          e.stopPropagation(); closePanel();
          resetSection(key, true);
        });
      }

      /* ── Sync hit area to image position ── */
      function syncHitArea() {
        const r = imgEl.getBoundingClientRect();
        /* Only update if image is actually rendered (has dimensions) */
        if (r.width === 0 || r.height === 0) return;
        hitArea.style.top    = r.top    + 'px';
        hitArea.style.left   = r.left   + 'px';
        hitArea.style.width  = r.width  + 'px';
        hitArea.style.height = r.height + 'px';
      }

      /* Sync after image load (handles hero images that load async) */
      if (imgEl.complete) {
        syncHitArea();
      } else {
        imgEl.addEventListener('load', syncHitArea, { once: true });
      }

      /* Also sync after full page load (all layout settled) */
      window.addEventListener('load', syncHitArea);
      window.addEventListener('scroll', syncHitArea, { passive: true });
      window.addEventListener('resize', syncHitArea, { passive: true });

      /* Hover: show dashed outline + badge */
      hitArea.addEventListener('mouseenter', () => {
        imgEl.style.outline       = '2px dashed rgba(201,168,76,.8)';
        imgEl.style.outlineOffset = '3px';
        const r = imgEl.getBoundingClientRect();
        badge.style.top     = (r.top + 8)  + 'px';
        badge.style.left    = (r.left + 8) + 'px';
        badge.style.display = 'block';
      });
      hitArea.addEventListener('mouseleave', () => {
        imgEl.style.outline       = '';
        imgEl.style.outlineOffset = '';
        badge.style.display = 'none';
      });

      /* Click: toggle panel */
      hitArea.addEventListener('click', e => {
        e.stopPropagation();
        if (activePanel) { closePanel(); return; }
        openPanel();
      });

      /* Close panel when clicking elsewhere */
      document.addEventListener('click', () => closePanel());
    });
  }

  async function boot() {
    snapshotOriginals();
    await applyContent();

    if (!token) return;

    try {
      const res = await fetch('/api/admin/verify', { headers: authHeaders() });
      if (!res.ok) throw new Error('Invalid session');
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    injectStyles();
    injectAdminBar();
    injectProgressBar();
    activateEditables();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();