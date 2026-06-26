console.log("✅ admin-edit.js loaded");
(function () {
  'use strict';

  const TOKEN_KEY = 'mdb_token';
  const token     = localStorage.getItem(TOKEN_KEY);

  /* Determine current page name from URL path */
  function getPageName() {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path.includes('/public/villa'))      return 'villa';
    if (path.includes('/public/interiors'))  return 'interiors';
    if (path.includes('/public/mhome'))      return 'mhome';
    if (path.includes('/public/tradition'))  return 'tradition';
    return 'index';
  }

  const PAGE = getPageName();
  console.log("Current pathname:", window.location.pathname);
  console.log("Detected PAGE:", PAGE);

  /* ── Helpers ── */
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
        pointerEvents: 'none',
        borderRadius: '4px',
      });
      document.body.appendChild(t);
    }
    clearTimeout(toastTimer);
    t.textContent = (type === 'ok' ? '✓ ' : '✕ ') + msg;
    t.style.background = type === 'ok'
      ? 'rgba(110,231,183,.15)' : 'rgba(248,113,113,.15)';
    t.style.border = type === 'ok'
      ? '1px solid rgba(110,231,183,.35)' : '1px solid rgba(248,113,113,.35)';
    t.style.color  = type === 'ok' ? '#6ee7b7' : '#f87171';
    t.style.opacity   = '1';
    t.style.transform = 'translateY(0)';
    toastTimer = setTimeout(() => {
      t.style.opacity   = '0';
      t.style.transform = 'translateY(8px)';
    }, 3200);
  }

  /* ── Admin toolbar CSS ── */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Admin mode indicator */
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
        width: 7px; height: 7px; background: #6ee7b7;
        border-radius: 50%; /* FIX: was "50" — missing % */
        animation: __mdb_pulse 2s infinite;
      }
      @keyframes __mdb_pulse {
        0%,100%{opacity:1} 50%{opacity:.4}
      }
      #__mdb_adminbar .ab-page {
        background: rgba(201,168,76,.15);
        border: 1px solid rgba(201,168,76,.3);
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

      /* Editable element hover state */
      [data-editable]:hover,
      [data-editable-img]:hover {
        outline: 2px dashed rgba(201,168,76,.7) !important;
        outline-offset: 3px !important;
        cursor: pointer !important;
      }

      /* Floating edit toolbar — appended to BODY, positioned absolutely */
      .__mdb_toolbar {
        position: fixed; z-index: 99980;
        display: flex; gap: 4px;
        background: rgba(7,7,7,.95);
        border: 1px solid rgba(201,168,76,.4);
        padding: 4px 6px;
        pointer-events: all;
        white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0,0,0,.5);
      }
      .__mdb_toolbar button {
        background: none; border: 1px solid rgba(255,255,255,.1);
        color: rgba(244,241,236,.8); padding: 3px 10px;
        font-family: 'DM Sans',sans-serif; font-size: 10px;
        letter-spacing: 1px; text-transform: uppercase;
        cursor: pointer; transition: all .2s;
      }
      .__mdb_toolbar button:hover { border-color: #C9A84C; color: #C9A84C; }
      .__mdb_toolbar button.danger:hover { border-color: #f87171; color: #f87171; }

      /* Inline text editor */
      .__mdb_editor_wrap {
        position: fixed; inset: 0; z-index: 99995;
        background: rgba(0,0,0,.75); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; padding: 20px;
      }
      .__mdb_editor_box {
        background: #141414; border: 1px solid rgba(201,168,76,.3);
        width: 100%; max-width: 640px;
        position: relative;
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
      .__mdb_editor_head button {
        background: none; border: none; color: #555;
        font-size: 18px; cursor: pointer; line-height: 1; padding: 2px 6px;
      }
      .__mdb_editor_head button:hover { color: #F4F1EC; }
      .__mdb_editor_body { padding: 18px; }
      .__mdb_editor_body textarea {
        width: 100%; min-height: 110px; resize: vertical;
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(255,255,255,.09);
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
        text-transform: uppercase; border: none; cursor: pointer;
        transition: all .2s;
      }
      .__mdb_editor_foot .save {
        background: #C9A84C; color: #070707;
      }
      .__mdb_editor_foot .save:hover { background: #E2C46A; }
      .__mdb_editor_foot .cancel {
        background: transparent; color: rgba(244,241,236,.5);
        border: 1px solid rgba(255,255,255,.1);
      }
      .__mdb_editor_foot .cancel:hover { border-color: #f87171; color: #f87171; }

      /* Image upload overlay — controlled via JS (not CSS sibling selector) */
      .__mdb_img_overlay {
        position: absolute; inset: 0; z-index: 9989;
        background: rgba(7,7,7,.65);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 8px;
        opacity: 0;
        transition: opacity .25s;
        pointer-events: none;
      }
      .__mdb_img_overlay.visible {
        opacity: 1;
        pointer-events: all;
      }
      .__mdb_img_overlay span {
        font-family: 'DM Sans',sans-serif; font-size: 12px;
        letter-spacing: 1.5px; text-transform: uppercase;
        color: rgba(244,241,236,.9);
      }
      .__mdb_img_overlay .cam { font-size: 28px; }

      /* Image upload progress */
      .__mdb_upload_bar {
        position: fixed; top: 40px; left: 0; right: 0; height: 3px;
        z-index: 99998; background: rgba(255,255,255,.05);
        display: none;
      }
      .__mdb_upload_bar_inner {
        height: 100%; background: #C9A84C; width: 0;
        transition: width .3s;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Snapshot original DOM content BEFORE applying DB overrides ──
     FIX: must be called before applyContent() so Reset truly reverts
     to what was in the HTML file, not the previously-saved DB value. */
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

  /* ── Apply saved content from DB to DOM ── */
  async function applyContent() {
    console.log("Fetching:", "/api/content/" + PAGE);
    try {
      const res  = await fetch('/api/content/' + PAGE);
      if (!res.ok) return;
      const data = await res.json(); // { sectionKey: { type, value } }
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

  /* ── Admin bar ── */
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

    /* Push nav down so it's not hidden behind admin bar */
    const nav = document.getElementById('nav');
    if (nav) nav.style.top = bar.offsetHeight + 'px';

    document.getElementById('__mdb_logout').addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      location.reload();
    });
  }

  /* ── Upload progress bar ── */
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

  /* ══════════════════════════════════════════════
     TEXT EDITOR MODAL
  ══════════════════════════════════════════════ */
  function openTextEditor(el, key) {
    const current = el.innerHTML;

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
          <p style="margin-top:8px;font-size:11px;color:#444;font-family:'DM Sans',sans-serif">
            HTML allowed (e.g. &lt;em&gt;, &lt;br&gt;, &lt;strong&gt;)
          </p>
        </div>
        <div class="__mdb_editor_foot">
          <button class="cancel" id="__mdb_ecancel">Cancel</button>
          <button class="save"   id="__mdb_esave">Save Changes</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    /* FIX: Set textarea value via JS to avoid HTML-encoding issues */
    document.getElementById('__mdb_etxt').value = current;

    const close = () => wrap.remove();

    document.getElementById('__mdb_eclose').addEventListener('click', close);
    document.getElementById('__mdb_ecancel').addEventListener('click', close);
    wrap.addEventListener('click', e => { if (e.target === wrap) close(); });

    document.getElementById('__mdb_esave').addEventListener('click', async () => {
      const value = document.getElementById('__mdb_etxt').value;
      const btn   = document.getElementById('__mdb_esave');
      btn.disabled    = true;
      btn.textContent = 'Saving…';

      try {
        const res = await fetch('/api/content', {
          method:  'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body:    JSON.stringify({ page: PAGE, section: key, type: 'text', value }),
        });
        if (!res.ok) throw new Error('Save failed');
        el.innerHTML = value;
        toast('Text saved');
        close();
      } catch (err) {
        toast(err.message, 'err');
        btn.disabled    = false;
        btn.textContent = 'Save Changes';
      }
    });

    setTimeout(() => document.getElementById('__mdb_etxt').focus(), 50);
  }

  /* ══════════════════════════════════════════════
     IMAGE UPLOAD
  ══════════════════════════════════════════════ */
  function triggerImageUpload(imgEl, key) {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) { input.remove(); return; }

      const MAX = 10 * 1024 * 1024;
      if (file.size > MAX) {
        toast('File too large (max 10 MB)', 'err');
        input.remove(); return;
      }

      const fd = new FormData();
      fd.append('image',   file);
      fd.append('page',    PAGE);
      fd.append('section', key);

      setProgress(10);
      try {
        const url = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload');
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
          /* NOTE: Do NOT set Content-Type here — browser sets it with
             the correct multipart boundary for FormData automatically */

          xhr.upload.addEventListener('progress', e => {
            if (e.lengthComputable)
              setProgress(Math.round((e.loaded / e.total) * 90));
          });

          xhr.addEventListener('load', () => {
            try {
              const data = JSON.parse(xhr.responseText);
              if (xhr.status >= 400) {
                reject(new Error(data.error || 'Upload failed (server error ' + xhr.status + ')'));
              } else {
                /* FIX: support both .path and .url (multer-storage-cloudinary
                   returns .path in some versions, .url or .secure_url in others) */
                const imageUrl = data.url || data.secure_url;
                if (!imageUrl) reject(new Error('Server returned no URL'));
                else resolve(imageUrl);
              }
            } catch {
              reject(new Error('Upload failed — invalid server response'));
            }
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

  /* ══════════════════════════════════════════════
     RESET A SECTION TO ORIGINAL
  ══════════════════════════════════════════════ */
  async function resetSection(key, isImg) {
    if (!confirm(`Reset "${key}" to original? This cannot be undone.`)) return;

    try {
      const res = await fetch('/api/content', {
        method:  'DELETE',
        /* FIX: include Content-Type so express.json() parses the body */
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body:    JSON.stringify({ page: PAGE, section: key }),
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

  /* ══════════════════════════════════════════════
     FLOATING TOOLBAR — appended to BODY and
     positioned with getBoundingClientRect() so it
     is never clipped by overflow:hidden ancestors
     or transform stacking contexts.
  ══════════════════════════════════════════════ */
  function createToolbar(el, key, isImg) {
    const toolbar = document.createElement('div');
    toolbar.className = '__mdb_toolbar';
    toolbar.innerHTML = isImg
      ? `<button class="edit-btn">📷 Change</button><button class="danger reset-btn">↺ Reset</button>`
      : `<button class="edit-btn">✏ Edit</button><button class="danger reset-btn">↺ Reset</button>`;
    document.body.appendChild(toolbar);

    function positionToolbar() {
      const rect = el.getBoundingClientRect();
      toolbar.style.top  = (rect.top - toolbar.offsetHeight - 6) + 'px';
      toolbar.style.left = rect.left + 'px';
    }
    positionToolbar();

    toolbar.querySelector('.edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (isImg) triggerImageUpload(el, key);
      else       openTextEditor(el, key);
    });
    toolbar.querySelector('.reset-btn').addEventListener('click', e => {
      e.stopPropagation();
      resetSection(key, isImg);
    });

    return toolbar;
  }

  /* ══════════════════════════════════════════════
     ATTACH EDIT BEHAVIOURS TO ALL EDITABLE ELS
  ══════════════════════════════════════════════ */
  function activateEditables() {

    /* ── TEXT elements ── */
    document.querySelectorAll('[data-editable]').forEach(el => {
      const key = el.dataset.editable;
      let toolbar = null;

      el.addEventListener('mouseenter', () => {
        if (toolbar) return;
        toolbar = createToolbar(el, key, false);
      });

      el.addEventListener('mouseleave', e => {
        if (toolbar && !toolbar.contains(e.relatedTarget)) {
          toolbar.remove();
          toolbar = null;
        }
      });

      /* Keep toolbar in sync if user scrolls while hovering */
      el.addEventListener('scroll', () => {
        if (toolbar) {
          const rect = el.getBoundingClientRect();
          toolbar.style.top  = (rect.top - toolbar.offsetHeight - 6) + 'px';
          toolbar.style.left = rect.left + 'px';
        }
      }, { passive: true });
    });

    /* ── IMAGE elements ── */
    document.querySelectorAll('[data-editable-img]').forEach(imgEl => {
      const key = imgEl.dataset.editableImg;

      /* Ensure parent wrapper is positioned */
      const wrapper = imgEl.parentElement;
      if (window.getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
      }

      /* Build overlay and insert it directly after the img */
      const overlay = document.createElement('div');
      overlay.className = '__mdb_img_overlay';
      overlay.innerHTML = `
        <span class="cam">📷</span>
        <span>Click to change image</span>
        <span style="font-size:9px;opacity:.6;margin-top:-4px">JPG · PNG · WebP · max 10MB</span>
        <div style="display:flex;gap:6px;margin-top:4px">
          <button class="upload-img-btn" style="
            background:rgba(201,168,76,.9);color:#070707;border:none;
            padding:5px 14px;font-size:10px;font-weight:600;
            letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;">
            Upload
          </button>
          <button class="reset-img-btn" style="
            background:transparent;color:rgba(244,241,236,.7);
            border:1px solid rgba(255,255,255,.2);
            padding:5px 12px;font-size:10px;font-weight:500;
            letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;">
            Reset
          </button>
        </div>`;

      /* Insert immediately after the img tag */
      imgEl.insertAdjacentElement('afterend', overlay);

      /* FIX: use JS events instead of broken CSS sibling hover selector */
      imgEl.addEventListener('mouseenter', () => overlay.classList.add('visible'));
      imgEl.addEventListener('mouseleave', e => {
        if (!overlay.contains(e.relatedTarget)) overlay.classList.remove('visible');
      });
      overlay.addEventListener('mouseleave', e => {
        if (e.relatedTarget !== imgEl) overlay.classList.remove('visible');
      });

      overlay.querySelector('.upload-img-btn').addEventListener('click', e => {
        e.stopPropagation();
        triggerImageUpload(imgEl, key);
      });
      overlay.querySelector('.reset-img-btn').addEventListener('click', e => {
        e.stopPropagation();
        resetSection(key, true);
      });
    });
  }

  /* ══════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════ */
  async function boot() {
    /* 1. Snapshot originals BEFORE applying DB overrides */
    snapshotOriginals();

    /* 2. Always apply saved content (visitors also benefit) */
    await applyContent();

    /* 3. Only activate editing UI if valid token exists */
    if (!token) return;

    try {
      const res = await fetch('/api/admin/verify', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Invalid session');
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    /* Admin confirmed — inject UI */
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