(() => {
  const C = window.CONFIG, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pinLen = String(C.pin).length;
  let current = 'lock';

  /* ---------- screens ---------- */
  function show(id) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    current = id; $('.screen.active').scrollTop = 0;
    const inside = !['lock', 'envelope'].includes(id);
    $('#backBtn').hidden = !inside || id === 'home'; $('#musicFab').hidden = !inside;
    if (id === 'countdown') tick();
    if (id === 'letter') renderLetter();
  }
  $$('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
  $('#backBtn').onclick = () => show('home');
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb(); if (!$('#backBtn').hidden) show('home'); } });

  /* ---------- floating hearts ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function heart() {
    const h = document.createElement('span'); h.className = 'heart'; h.textContent = Math.random() > .3 ? '♥' : '❀';
    h.style.cssText = `left:${Math.random() * 100}%;font-size:${10 + Math.random() * 20}px;animation-duration:${8 + Math.random() * 8}s;--dx:${(Math.random() - .5) * 120}px`;
    h.onanimationend = () => h.remove(); $('#hearts').appendChild(h);
  }
  if (!reduce) { for (let i = 0; i < 6; i++) setTimeout(heart, i * 400); setInterval(() => document.hidden || heart(), 1100); }

  /* ---------- text from config ---------- */
  document.title = C.siteTitle; $('#siteTitle').textContent = C.siteTitle; $('#pinHint').textContent = C.pinHint || '';
  $('#envTo').textContent = C.herName; $('#homeName').textContent = C.herName; $('#welcomeLine').textContent = C.welcomeLine;

  /* ---------- PIN lock ---------- */
  let entered = '';
  const dots = $('#dots'); dots.innerHTML = '<i></i>'.repeat(pinLen);
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].forEach(k => {
    const b = document.createElement('button'); b.textContent = k; b.type = 'button';
    if (!k) b.style.visibility = 'hidden'; else b.onclick = () => key(k); $('#pad').appendChild(b);
  });
  function paint() { $$('i', dots).forEach((d, i) => d.classList.toggle('on', i < entered.length)); }
  function key(k) {
    if (current !== 'lock') return;
    $('#pinMsg').textContent = '';
    if (k === '⌫' || k === 'Backspace') entered = entered.slice(0, -1);
    else if (/^\d$/.test(k) && entered.length < pinLen) entered += k;
    paint();
    if (entered.length === pinLen) setTimeout(check, 180);
  }
  function check() {
    if (entered === String(C.pin)) { entered = ''; paint(); resetEnvelope(); show('envelope'); }
    else {
      entered = ''; paint(); $('#pinMsg').textContent = 'Not quite, try again 💭';
      const c = $('#lock .card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    }
  }
  addEventListener('keydown', e => { if (current === 'lock' && (/^\d$/.test(e.key) || e.key === 'Backspace')) key(e.key); });
  $('#relock').onclick = () => { pause(); show('lock'); };

  /* ---------- envelope ---------- */
  const env = $('#env');
  function resetEnvelope() { env.classList.remove('open'); env.dataset.busy = ''; }
  function openEnv() {
    if (env.dataset.busy) return; env.dataset.busy = 1; env.classList.add('open');
    setTimeout(() => show('home'), 2100);
  }
  env.onclick = openEnv; env.onkeydown = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openEnv());

  /* ---------- countdown ---------- */
  const unit = (n, l) => `<div class="unit"><b>${n}</b><small>${l}</small></div>`;
  function tick() {
    const now = new Date(), s = new Date(C.startDate + 'T00:00:00');
    if (!isNaN(s)) {
      let y = now.getFullYear() - s.getFullYear(), m = now.getMonth() - s.getMonth(), d = now.getDate() - s.getDate();
      if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      if (y < 0) { y = m = d = 0; }
      $('#together').innerHTML = unit(y, 'years') + unit(m, 'months') + unit(d, 'days');
      $('#daysTotal').textContent = `That's ${Math.max(0, Math.floor((now - s) / 864e5)).toLocaleString()} days of us ♡`;
    }
    let t = new Date(C.specialDate.date); $('#specialLabel').textContent = `Countdown to ${C.specialDate.label}`;
    if (!isNaN(t)) {
      while (t < now && now - t > 864e5) t.setFullYear(t.getFullYear() + 1);
      const diff = t - now;
      if (diff <= 0) { $('#special').innerHTML = ''; $('#specialDone').textContent = `Today is ${C.specialDate.label}! 🎉`; }
      else {
        $('#specialDone').textContent = '';
        const D = Math.floor(diff / 864e5), H = Math.floor(diff / 36e5) % 24, M = Math.floor(diff / 6e4) % 60, S = Math.floor(diff / 1e3) % 60;
        $('#special').innerHTML = unit(D, 'days') + unit(H, 'hours') + unit(M, 'min') + unit(S, 'sec');
      }
    }
  }
  setInterval(() => current === 'countdown' && tick(), 1000);

  /* ---------- music ---------- */
  const audio = new Audio(); audio.preload = 'metadata'; audio.volume = .8;
  let localFile = false, hasSrc = !!(C.music && C.music.src);
  $('#trackTitle').textContent = C.music.title; $('#trackArtist').textContent = C.music.artist;
  if (hasSrc) audio.src = C.music.src;
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  function ui(p) { $('#playBtn').textContent = p ? '❚❚' : '▶'; $('#vinyl').classList.toggle('play', p); $('#musicFab').classList.toggle('on', p); }
  function missing() { $('#musicNote').hidden = false; ui(false); }
  function play() {
    if (!audio.src) return missing();
    const p = audio.play(); p && p.then(() => { $('#musicNote').hidden = true; ui(true); }).catch(missing);
  }
  function pause() { audio.pause(); ui(false); }
  const toggle = () => audio.paused ? play() : pause();
  $('#playBtn').onclick = $('#musicFab').onclick = toggle;
  audio.onerror = () => { if (!localFile) missing(); };
  audio.onloadedmetadata = () => $('#dur').textContent = fmt(audio.duration);
  audio.ontimeupdate = () => { $('#cur').textContent = fmt(audio.currentTime); if (audio.duration) $('#seek').value = audio.currentTime / audio.duration * 100; };
  audio.onended = () => ui(false);
  $('#seek').oninput = e => audio.duration && (audio.currentTime = e.target.value / 100 * audio.duration);
  $('#vol').oninput = e => audio.volume = e.target.value;
  $('#loopBtn').onclick = e => { audio.loop = !audio.loop; e.currentTarget.setAttribute('aria-pressed', audio.loop); };
  $('#file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    localFile = true; audio.src = URL.createObjectURL(f); $('#trackTitle').textContent = f.name.replace(/\.[^.]+$/, ''); $('#trackArtist').textContent = 'Chosen from your device'; play();
  };

  /* ---------- gallery ---------- */
  const photos = C.photos || []; let idx = 0;
  function img(p, alt) {
    const i = new Image(); i.alt = alt || ''; i.loading = 'lazy';
    i.onerror = () => { const d = document.createElement('div'); d.className = 'ph'; d.textContent = '♥'; d.setAttribute('role', 'img'); d.setAttribute('aria-label', alt || 'Photo placeholder'); i.replaceWith(d); };
    i.src = p; return i;
  }
  photos.forEach((p, n) => {
    const f = document.createElement('figure'); f.className = 'polaroid'; f.style.cssText = `margin:0;--r:${(n % 2 ? 1 : -1) * (1 + Math.random() * 2).toFixed(1)}deg`;
    f.tabIndex = 0; f.append(img(p.src, p.caption)); const c = document.createElement('p'); c.textContent = p.caption || ''; f.append(c);
    f.onclick = () => openLb(n); f.onkeydown = e => e.key === 'Enter' && openLb(n); $('#gallery').appendChild(f);
  });
  if (!photos.length) $('#gallery').innerHTML = '<p class="muted">Add photos in js/config.js ♡</p>';
  const lb = $('#lightbox');
  function openLb(n) {
    idx = (n + photos.length) % photos.length; const fig = $('figure', lb), old = $('#lbImg', lb) || $('.ph', fig);
    const ni = img(photos[idx].src, photos[idx].caption); ni.id = 'lbImg'; fig.replaceChild(ni, fig.firstElementChild);
    $('#lbCap').textContent = photos[idx].caption || ''; lb.hidden = false;
  }
  function closeLb() { lb.hidden = true; }
  $('.lb-x', lb).onclick = closeLb; $('.lb-p', lb).onclick = () => openLb(idx - 1); $('.lb-n', lb).onclick = () => openLb(idx + 1);
  lb.onclick = e => e.target === lb && closeLb();
  addEventListener('keydown', e => { if (!lb.hidden) { if (e.key === 'ArrowLeft') openLb(idx - 1); if (e.key === 'ArrowRight') openLb(idx + 1); } });

  /* ---------- gift ---------- */
  const gb = $('#giftBox'); $('#giftLabel').textContent = C.gift.boxLabel; $('#giftTitle').textContent = C.gift.title;
  $('#giftMsg').textContent = C.gift.message; $('#giftBtn').textContent = C.gift.buttonText;
  function openGift() {
    if (gb.classList.contains('open')) return; gb.classList.add('open'); $('#giftLabel').hidden = true;
    setTimeout(() => { $('#giftCard').hidden = false; $('#giftCard').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 600);
    confetti();
  }
  function confetti() {
    const r = gb.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + 30;
    for (let i = 0; i < 36; i++) {
      const e = document.createElement('span'); e.className = 'confetti'; e.textContent = ['♥', '❀', '✿', '♡'][i % 4]; e.style.left = cx + 'px'; e.style.top = cy + 'px';
      e.style.color = ['#e0457b', '#ff8fb3', '#b3205f', '#ffd1dc'][i % 4]; document.body.appendChild(e);
      const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 180;
      const an = e.animate([{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v - 90}px) rotate(${Math.random() * 360}deg) scale(1.1)`, opacity: 1, offset: .5 }, { transform: `translate(${Math.cos(a) * v * 1.2}px,${Math.sin(a) * v + 260}px) rotate(540deg) scale(.8)`, opacity: 0 }], { duration: 1800 + Math.random() * 800, easing: 'ease-out' });
      an.onfinish = () => e.remove();
    }
  }
  gb.onclick = openGift; gb.onkeydown = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openGift());
  $('#giftBtn').onclick = confetti;

  /* ---------- letter ---------- */
  const KEY = 'surprise_letter_v1', body = $('#lBody'); let editing = false;
  function renderLetter() {
    $('#lTitle').textContent = C.letter.title; $('#lSig').textContent = `${C.letter.signature} ${C.fromName}`;
    let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
    const list = Array.isArray(saved) && saved.length ? saved : C.letter.paragraphs;
    body.innerHTML = ''; list.forEach((t, i) => { const p = document.createElement('p'); p.textContent = t; p.style.animationDelay = i * .5 + 's'; body.appendChild(p); });
    $('#resetBtn').hidden = !(saved && saved.length);
  }
  $('#editBtn').onclick = () => {
    editing = !editing; body.contentEditable = editing; $('#editBtn').textContent = editing ? '✓ Save letter' : '✎ Edit letter';
    if (editing) body.focus();
    else { const list = $$('p', body).map(p => p.textContent.trim()).filter(Boolean); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { } renderLetter(); }
  };
  $('#resetBtn').onclick = () => { try { localStorage.removeItem(KEY); } catch (e) { } renderLetter(); };
  renderLetter(); paint();
})();
