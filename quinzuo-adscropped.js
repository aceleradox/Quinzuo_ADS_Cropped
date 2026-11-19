/*!
 * Quinzuo AdsCropped CDN — v1.0.0
 * ------------------------------------------------------------
 * Uso:
 *   <script src="https://cdn.jsdelivr.net/gh/aceleradox/Quinzuo_ADS_Cropped@1.0.0/quinzuo-adscropped.jss"></script>
 *
 *   // Config global
 *   qz.config({ smartlink: 'https://ad.magnect.link/SEU_ID', cooldown: 30 });
 *
 *   // Estratégias (fluente, no seu estilo):
 *   qz.magnect.link('https://ad.magnect.link/X').after(2);
 *   qz.embed.link('https://ad.embed.link/X').after(3).onIframe('iframe');
 *   qz.fuction.link('https://ad.fuction.link/X', fn).click('#btn');
 *   qz.chain('custom').link('https://...').scroll(60).exit().hidden();
 * ------------------------------------------------------------
 */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else global.Quinzuo = global.qz = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const VERSION = '1.0.0';

  const CFG = {
    smartlink:     '',       // link default
    cooldown:      30,       // segundos entre aberturas
    maxPerSession: 5,        // limite por sessão
    debug:         false,
    popup:         true,     // true = window.open | false = <a>.click()
  };

  const STATE = { opened: 0, lastAt: 0, hooks: {} };

  function log() { if (CFG.debug) console.log.apply(console, ['[QZ]'].concat([].slice.call(arguments))); }
  function fire(hook, data) {
    (STATE.hooks[hook] || []).forEach(function (fn) { try { fn(data); } catch (e) { log('hook err', e); } });
  }
  function canOpen() {
    if (STATE.opened >= CFG.maxPerSession) { log('maxPerSession'); return false; }
    if (Date.now() - STATE.lastAt < CFG.cooldown * 1000) { log('cooldown'); return false; }
    return true;
  }
  function openAd(url) {
    url = url || CFG.smartlink;
    if (!url) { log('smartlink vazio'); return false; }
    if (!canOpen()) { fire('blocked', { url }); return false; }
    STATE.opened++; STATE.lastAt = Date.now();
    try {
      if (CFG.popup) {
        const w = global.open(url, '_blank', 'noopener');
        if (!w) { log('popup bloqueado'); fire('popupblocked', { url }); }
      } else {
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
      }
      fire('open', { url });
      return true;
    } catch (e) { log('open err', e); return false; }
  }

  /* ---------- Chain (builder fluente) ---------- */
  function Chain(name, url) {
    this.name = name; this.url = url || '';
    this._install = null; this._armed = false;
    this._fn = null; this._count = 0; this._max = Infinity;
  }

  Chain.prototype.link     = function (u) { this.url = u || CFG.smartlink; return this; };
  Chain.prototype.fn       = function (f) { this._fn = f; return this; };
  Chain.prototype.once     = function ()  { this._max = 1; return this; };
  Chain.prototype.limit    = function (n) { this._max = n; return this; };
  Chain.prototype._arm     = function () {
    if (this._armed) return this;
    this._armed = true;
    if (this._install) this._install.call(this);
    return this;
  };
  Chain.prototype.show     = function () { return this._arm(); };
  Chain.prototype.after    = function (s) { const self = this; setTimeout(() => self._arm(), s * 1000); return this; };

  Chain.prototype.idle = function (s) {
    const self = this; let t = null;
    const reset = () => { if (t) clearTimeout(t); t = setTimeout(() => self._arm(), s * 1000); };
    ['mousemove','keydown','scroll','click','touchstart'].forEach(ev => global.addEventListener(ev, reset, { passive: true }));
    reset(); return this;
  };

  Chain.prototype._tryOpen = function (ctx) {
    if (this._count >= this._max) return false;
    if (this._fn) { try { if (this._fn(ctx || {}) === false) return false; } catch (e) { log('fn err', e); return false; } }
    this._count++;
    return openAd(this.url);
  };

  Chain.prototype.click = function (sel) {
    const self = this;
    const els = typeof sel === 'string' ? document.querySelectorAll(sel) : [sel];
    Array.prototype.forEach.call(els, el => {
      if (!el) return;
      el.addEventListener('click', e => self._tryOpen({ event: e, el }));
    });
    return this;
  };

  Chain.prototype.anyClick = function () {
    const self = this;
    document.addEventListener('click', e => self._tryOpen({ event: e }));
    return this;
  };

  Chain.prototype.timer = function (s) {
    const self = this; setTimeout(() => self._tryOpen({}), s * 1000); return this;
  };

  Chain.prototype.scroll = function (percent) {
    const self = this;
    function onScroll() {
      const h = document.documentElement;
      const p = (h.scrollTop + h.clientHeight) / h.scrollHeight * 100;
      if (p >= percent) { self._tryOpen({ percent: p }); global.removeEventListener('scroll', onScroll); }
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    return this;
  };

  Chain.prototype.exit = function () {
    const self = this;
    function onOut(e) { if (e.clientY < 10) { self._tryOpen({ event: e }); document.removeEventListener('mouseout', onOut); } }
    document.addEventListener('mouseout', onOut); return this;
  };

  Chain.prototype.hidden = function () {
    const self = this;
    document.addEventListener('visibilitychange', () => { if (document.hidden) self._tryOpen({}); });
    return this;
  };

  Chain.prototype.anyKey = function () {
    const self = this;
    global.addEventListener('keydown', e => self._tryOpen({ event: e }), { once: true });
    return this;
  };

  /* ---------- Módulos no SEU estilo ---------- */

  // ad.magnect.link(url) → overlay invisível captura QUALQUER clique
  const magnect = {
    link(url) {
      const c = new Chain('magnect', url);
      c._install = function () {
        const ov = document.createElement('div');
        ov.id = 'qz-magnect-overlay';
        ov.style.cssText = 'position:fixed;inset:0;z-index:2147483646;cursor:pointer;background:transparent;';
        ov.addEventListener('click', () => { c._tryOpen({}); ov.remove(); });
        document.body.appendChild(ov);
        log('magnect overlay ativo');
      };
      return c;
    }
  };

  // ad.embed.link(url) → overlay de área (iframe/video)
  const embed = {
    link(url) {
      const c = new Chain('embed', url);
      c.onIframe = function (sel) {
        const ifr = document.querySelector(sel || 'iframe');
        if (!ifr) return c;
        const wrap = ifr.parentElement;
        if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
        const ov = document.createElement('div');
        ov.style.cssText = 'position:absolute;inset:0;cursor:pointer;background:rgba(0,0,0,.01);z-index:10;';
        ov.addEventListener('click', () => { c._tryOpen({}); ov.remove(); });
        wrap.appendChild(ov);
        return c;
      };
      return c;
    }
  };

  // ad.fuction.link(url, fn) → trigger 100% customizado
  const fuction = {
    link(url, fn) {
      const c = new Chain('fuction', url);
      if (fn) c.fn(fn);
      c.install = () => c._arm();
      return c;
    }
  };

  /* ---------- API pública ---------- */
  const api = {
    version: VERSION,
    config:     o => { Object.assign(CFG, o || {}); return api; },
    link:       u => { CFG.smartlink = u; return api; },
    smartlink:  u => { CFG.smartlink = u; return api; },
    open:       openAd,
    on:         (h, fn) => { (STATE.hooks[h] = STATE.hooks[h] || []).push(fn); return api; },
    state:      () => ({ opened: STATE.opened, lastAt: STATE.lastAt, config: CFG }),
    reset:      () => { STATE.opened = 0; STATE.lastAt = 0; return api; },
    chain:      (n, u) => new Chain(n || 'custom', u),
    // seus 3 módulos:
    magnect, embed, fuction,
    'function': fuction     // alias
  };

  log('carregado v' + VERSION);
  return api;
});
