/* ==========================================================
   Animaciones: aparición al hacer scroll (el hero no se anima),
   cabecera compacta, "volar al carrito", rebote del contador y
   zoom de la foto en la ficha. Todo se desactiva con
   prefers-reduced-motion. Se carga antes de app.js.
   ========================================================== */
(function () {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let io = null, lastCount = null;

  // Qué elementos aparecen con scroll (cada uno recibe .reveal)
  const REVEAL = [
    '.sec-head', '.page-head', '.cat-card', '.acc-card', '.prod', '.col-card', '.post',
    '.value', '.step', '.channel', '.split > *', '.featured', '.cta-box', '.values-in > .center',
    '.ship-bar', '.line', '.summary', '.co-card', '.steps-bar', '.faq', '.wa-box', '.form',
    '.pd-media', '.pd-info > *', '.cart-empty', '.empty',
  ].join(',');

  function observe(els) {
    if (!els.length) return;
    const counters = new Map();
    els.forEach(el => {
      const parent = el.parentElement, i = (counters.get(parent) || 0) + 1;
      counters.set(parent, i);
      el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');   // cascada dentro de cada grupo
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Llamada desde render() en app.js. scroll === 'top' => cambio de página
  window.motionInit = function (scroll) {
    if (io) io.disconnect();
    document.querySelectorAll('#app .frame > img').forEach(i => i.complete && i.naturalWidth && i.classList.add('loaded'));
    if (reduce() || !('IntersectionObserver' in window)) return;

    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target; io.unobserve(el); el.classList.add('in');
        // al terminar, soltamos la clase para no interferir con hovers
        setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 1000 + (parseInt(el.style.getPropertyValue('--d')) || 0));
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    const app = document.querySelector('#app');
    if (scroll === 'top') {
      observe([...app.querySelectorAll(REVEAL)]);
      // pie y newsletter: una sola vez
      observe([...document.querySelectorAll('.news-in, .foot-in > div')].filter(el => !el.dataset.rv && (el.dataset.rv = 1)));
    } else if (document.body.dataset.route === 'productos') {
      observe([...app.querySelectorAll('.prod')]);   // al filtrar/ordenar, las tarjetas entran de nuevo
    }
    onScroll();
  };

  // Rebote del contador al sumar productos (llamada desde renderChrome)
  window.motionChrome = function () {
    const n = typeof cartCount === 'function' ? cartCount() : 0;
    if (lastCount !== null && n > lastCount && !reduce()) {
      const b = document.querySelector('.badge.rosa'); if (b) b.classList.add('bump');
    }
    lastCount = n;
  };

  // El producto vuela desde su foto hasta la bolsa del header; al llegar ejecuta done()
  window.flyToCart = function (btn, done) {
    const bag = document.querySelector('.tool[data-act="cart"]');
    if (reduce() || !bag || !btn.animate) return done();
    const holder = btn.closest('.prod, .pd');
    const img = holder && holder.querySelector('.frame > img.loaded');
    const r = (img || btn).getBoundingClientRect(), t = bag.getBoundingClientRect();
    const size = Math.min(r.width, r.height, 140);
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const el = document.createElement('div');
    el.className = 'fly';
    Object.assign(el.style, { width: size + 'px', height: size + 'px', left: cx - size / 2 + 'px', top: cy - size / 2 + 'px' });
    if (img) el.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    document.body.appendChild(el);
    const dx = t.left + t.width / 2 - cx, dy = t.top + t.height / 2 - cy;
    const a = el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 70}px) scale(.6)`, opacity: .95, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08)`, opacity: .3, borderRadius: '50%' },
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.25,1)' });
    a.onfinish = () => { el.remove(); done(); };
    a.oncancel = () => { el.remove(); done(); };
  };

  // Scroll: cabecera compacta
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      document.querySelector('#header').classList.toggle('scrolled', y > 40);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Rebote del corazón (tarjetas y ficha)
  document.addEventListener('click', e => {
    const f = e.target.closest('.fav, .pd-fav');
    if (f && !reduce()) { f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop'); }
  });
  document.addEventListener('animationend', e => {
    if (e.target.classList.contains('bump')) e.target.classList.remove('bump');
  });

  // Zoom de la foto de la ficha siguiendo el cursor
  document.addEventListener('mousemove', e => {
    const m = e.target.closest && e.target.closest('.pd-media .frame'); if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100) + '%');
    m.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100) + '%');
  });
})();
