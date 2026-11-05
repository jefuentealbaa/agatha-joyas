/* ==========================================================
   Carrito, checkout y confirmación — SOLO VISUAL
   - El carrito guarda { idProducto: cantidad } en localStorage
   - No hay pagos, validaciones ni backend: el checkout es una maqueta
   - Se carga ANTES de app.js; usa sus helpers (ic, fmt, image, store...)
     solo dentro de funciones, que se ejecutan cuando app.js ya existe.
   ========================================================== */

Object.assign(ICONS, {
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus:  '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
  card:  '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  bank:  '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7"/>',
  box:   '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
});

const FREE_SHIP = 30000;   // envío gratis sobre este monto (a domicilio)
const SHIP_OPTS = [
  { id: 'starken',     name: 'Starken a domicilio',    note: '2 a 4 días hábiles',                          price: 3990 },
  { id: 'chilexpress', name: 'Chilexpress express',    note: '1 a 2 días hábiles',                          price: 4990 },
  { id: 'retiro',      name: 'Retiro en Concepción',   note: 'Coordinamos punto y horario por WhatsApp',    price: 0 },
];
const PAY_OPTS = [
  { id: 'webpay', name: 'Webpay',                 note: 'Tarjetas de crédito y débito',      icon: 'card' },
  { id: 'mp',     name: 'Mercado Pago',           note: 'Tarjetas, saldo en cuenta y cuotas', icon: 'lock' },
  { id: 'transf', name: 'Transferencia bancaria', note: 'Reservamos tu pedido por 24 horas',  icon: 'bank' },
];
const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'];

// ---------- Estado del carrito ----------
let _cart = null, _ship = 'starken', _pay = 'webpay';
function cartAll() {
  if (!_cart) {
    const saved = store.get('agatha.cart.v2', null);
    // Primera visita: dos productos de ejemplo para que el flujo se vea completo
    _cart = saved && typeof saved === 'object' ? saved : { 'collar-estrella': 1, 'pulsera-perla': 1 };
  }
  return _cart;
}
const cartSave = () => store.set('agatha.cart.v2', _cart);
const cartLines = () => Object.entries(cartAll()).map(([id, qty]) => ({ p: PRODUCTS.find(p => p.id === id), qty })).filter(l => l.p && l.qty > 0);
const cartCount = () => cartLines().reduce((n, l) => n + l.qty, 0);
const cartSubtotal = () => cartLines().reduce((n, l) => n + l.p.price * l.qty, 0);
const shipCost = (opt, sub) => (opt.price === 0 || sub >= FREE_SHIP ? 0 : opt.price);
const shipLabel = c => (c === 0 ? 'Gratis' : fmt(c));

function cartAdd(id, n = 1) { const c = cartAll(); c[id] = Math.min(9, (c[id] || 0) + n); cartSave(); cartRefresh(); }
function cartSet(id, qty) { const c = cartAll(); if (qty <= 0) delete c[id]; else c[id] = Math.min(9, qty); cartSave(); cartRefresh(); }

// Refresca todo lo que muestre el carrito sin perder lo que el usuario escribe en el checkout
function cartRefresh() {
  renderChrome();
  if (!$('#drawer').hidden) renderDrawer();
  const route = currentRoute();
  if (route === 'carrito') { const y = scrollY; render(); scrollTo({ top: y, behavior: 'instant' }); }
  else if (route === 'checkout') { if (!cartCount()) render(); else refreshCheckoutSummary(); }
}

// ---------- Piezas visuales ----------
const thumb = (p, cls = '') => `<div class="thumb ${cls}">${image(p.id, p.photo, 'r-1')}</div>`;
const qtyStepper = l => `<div class="qty" role="group" aria-label="Cantidad de ${l.p.name}">
  <button data-act="qty" data-id="${l.p.id}" data-d="-1" aria-label="Quitar una unidad">${ic('minus', 'sm')}</button>
  <span aria-live="polite">${l.qty}</span>
  <button data-act="qty" data-id="${l.p.id}" data-d="1" aria-label="Agregar una unidad" ${l.qty >= 9 ? 'disabled' : ''}>${ic('plus', 'sm')}</button></div>`;

function shipProgress(sub) {
  const left = FREE_SHIP - sub, pct = Math.min(100, Math.round(sub / FREE_SHIP * 100));
  return `<div class="ship-bar"><div class="ship-msg">${left > 0
    ? `Te faltan <b>${fmt(left)}</b> para el envío gratis`
    : `${ic('check', 'sm')}<b>¡Tienes envío gratis!</b>`}</div><div class="ship-track"><i style="width:${pct}%"></i></div></div>`;
}

const emptyCart = (compact) => `<div class="cart-empty">${ic('bag', 'lg')}<div class="t">Tu carrito está vacío</div>
  <p class="muted">Agrega joyas para verlas aquí.</p>
  <button class="btn btn-primary btn-sm" data-go="productos">Ver productos</button></div>`;

// ---------- Panel lateral (mini carrito) ----------
function renderDrawer() {
  const lines = cartLines(), sub = cartSubtotal();
  $('#drawer').innerHTML = `
    <div class="drawer-head"><h2>Tu carrito${lines.length ? ` <span>(${cartCount()})</span>` : ''}</h2>
      <button class="tool" data-act="drawer-close" aria-label="Cerrar carrito">${ic('close')}</button></div>
    ${lines.length ? `
    <div class="drawer-body">
      ${shipProgress(sub)}
      ${lines.map(l => `<div class="dline">${thumb(l.p)}
        <div class="dline-info"><div class="prod-cat">${l.p.cat}</div><div class="prod-name" style="font-size:17px"><a href="#/producto/${l.p.id}">${l.p.name}</a></div>
          <div class="dline-row">${qtyStepper(l)}<b>${fmt(l.p.price * l.qty)}</b></div>
          <button class="btn-link" data-act="cart-remove" data-id="${l.p.id}" style="align-self:flex-start;margin-top:4px">Quitar</button></div></div>`).join('')}
    </div>
    <div class="drawer-foot">
      <div class="row"><span>Subtotal</span><b>${fmt(sub)}</b></div>
      <p class="muted" style="font-size:12px;margin:0">IVA incluido. El envío se calcula en el checkout.</p>
      ${arrowBtn('Finalizar compra', 'btn-primary', 'data-go="checkout" style="width:100%;justify-content:center"')}
      <button class="btn" data-go="carrito" style="width:100%;justify-content:center">Ver carrito</button>
    </div>` : `<div class="drawer-body">${emptyCart()}</div>`}`;
}
let _drawerTimer;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function openDrawer() {
  clearTimeout(_drawerTimer);
  const d = $('#drawer'), ov = $('#drawer-ov');
  renderDrawer(); d.classList.remove('closing'); ov.classList.remove('closing');
  d.hidden = false; ov.hidden = false;
  d.classList.add('opening'); setTimeout(() => d.classList.remove('opening'), 900);   // anima la entrada una sola vez
  document.body.classList.add('noscroll'); $('#drawer .tool').focus();
}
function closeDrawer() {
  const d = $('#drawer'), ov = $('#drawer-ov');
  if (d.hidden || d.classList.contains('closing')) return;
  const finish = () => { d.hidden = true; ov.hidden = true; d.classList.remove('closing', 'opening'); ov.classList.remove('closing'); document.body.classList.remove('noscroll'); };
  if (reducedMotion()) return finish();
  d.classList.add('closing'); ov.classList.add('closing');
  _drawerTimer = setTimeout(finish, 280);   // espera la animación de salida
}

// ---------- Páginas ----------
function totalsHTML(sub, shipOpt) {
  const ship = shipCost(shipOpt, sub);
  return `<div class="row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
    <div class="row"><span>Envío <small class="muted">(${shipOpt.name})</small></span><span>${shipLabel(ship)}</span></div>
    <div class="row total"><span>Total</span><span>${fmt(sub + ship)}</span></div>
    <p class="muted" style="font-size:12px;margin:0">IVA incluido</p>`;
}
const couponBox = () => `<form class="coupon" data-act="coupon"><input placeholder="Código de descuento" aria-label="Código de descuento"><button class="btn btn-sm" type="submit">Aplicar</button></form>`;

const CART_PAGES = {
  carrito() {
    const lines = cartLines(), sub = cartSubtotal();
    const head = `<div class="page-head">${crumb('Carrito')}<h1 class="h1">Tu carrito</h1>
      ${lines.length ? `<p class="muted">${cartCount()} producto${cartCount() === 1 ? '' : 's'}</p>` : ''}</div>`;
    if (!lines.length) return `<section class="section bottom" style="display:flex;flex-direction:column;gap:32px">${head}${emptyCart()}</section>`;
    const suggestions = PRODUCTS.filter(p => !p.soldOut && !cartAll()[p.id]).slice(0, 4);
    return `<section class="section bottom" style="display:flex;flex-direction:column;gap:32px">${head}
      <div class="cart-layout">
        <div>
          ${shipProgress(sub)}
          <div class="lines">${lines.map(l => `<div class="line">${thumb(l.p)}
            <div class="line-info"><div class="prod-cat">${l.p.cat}</div><div class="prod-name"><a href="#/producto/${l.p.id}">${l.p.name}</a></div><div class="muted" style="font-size:13px">${fmt(l.p.price)} c/u</div>
              <button class="btn-link" data-act="cart-remove" data-id="${l.p.id}" style="align-self:flex-start;margin-top:6px">Quitar</button></div>
            ${qtyStepper(l)}<div class="line-total">${fmt(l.p.price * l.qty)}</div></div>`).join('')}</div>
          <button class="btn-link" data-go="productos" style="margin-top:24px">← Seguir comprando</button>
        </div>
        <aside class="summary" aria-label="Resumen del pedido">
          <h2 class="h3" style="font-size:24px">Resumen</h2>
          ${couponBox()}
          <div class="row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
          <div class="row"><span>Envío</span><span class="muted">Se calcula en el checkout</span></div>
          <div class="row total"><span>Total</span><span>${fmt(sub)}</span></div>
          <p class="muted" style="font-size:12px;margin:0">IVA incluido</p>
          ${arrowBtn('Ir a pagar', 'btn-primary', 'data-go="checkout" style="width:100%;justify-content:center"')}
          <ul class="trust"><li>${ic('lock', 'sm')}Pago seguro con Webpay y Mercado Pago</li><li>${ic('repeat', 'sm')}Cambios sin costo hasta 30 días</li><li>${ic('box', 'sm')}Cada pedido va en caja Agatha</li></ul>
        </aside>
      </div>
    </section>
    ${suggestions.length ? `<section class="section bottom" style="padding-top:0">
      ${sectionHead('Para completar tu pedido', 'Te puede gustar')}
      <div class="grid-prod">${suggestions.map(productCard).join('')}</div></section>` : ''}`;
  },

  checkout() {
    const lines = cartLines(), sub = cartSubtotal();
    if (!lines.length) return `<section class="section bottom" style="display:flex;flex-direction:column;gap:32px"><div class="page-head">${crumb('Checkout')}<h1 class="h1">Checkout</h1></div>${emptyCart()}</section>`;
    const shipOpt = SHIP_OPTS.find(o => o.id === _ship);
    const opt = (name, o, icon, checked, extra) => `<div class="opt"><label class="opt-head"><input type="radio" name="${name}" value="${o.id}" data-act="${name}" ${checked ? 'checked' : ''}>
      ${icon ? `<span class="opt-ic">${ic(icon)}</span>` : ''}<span class="opt-txt"><b>${o.name}</b><small>${o.note}</small></span>${extra || ''}</label>`;
    const payPanels = {
      webpay: `<div class="opt-panel"><p>Te llevaremos a Webpay Plus para pagar de forma segura. Aquí es solo una vista de ejemplo.</p>
        <label class="field" style="max-width:260px">Cuotas<select><option>Sin cuotas</option><option>3 cuotas sin interés</option><option>6 cuotas</option></select></label></div>`,
      mp: `<div class="opt-panel"><p>Serás redirigida a Mercado Pago para elegir tu medio de pago. Aquí es solo una vista de ejemplo.</p></div>`,
      transf: `<div class="opt-panel"><p>Datos de ejemplo para transferir:</p>
        <dl class="bank"><dt>Banco</dt><dd>Banco de ejemplo</dd><dt>Cuenta</dt><dd>Cuenta corriente 000 000 000</dd><dt>Titular</dt><dd>Agatha Accesorios SpA</dd><dt>RUT</dt><dd>00.000.000-0</dd><dt>Correo</dt><dd>pagos@agathaaccesorios.cl</dd></dl></div>`,
    };
    return `
    <section class="section bottom" style="display:flex;flex-direction:column;gap:32px">
      <div class="page-head">${crumb('Checkout')}<h1 class="h1">Finalizar compra</h1></div>
      <ol class="steps-bar" aria-label="Progreso"><li class="done"><span>${ic('check', 'sm')}</span>Carrito</li><li class="on"><span>2</span>Datos y pago</li><li><span>3</span>Confirmación</li></ol>
      <div class="cart-layout">
        <form id="checkout-form" class="co" novalidate>
          <section class="co-card"><h2><i>1</i>Contacto</h2>
            <div class="fields">
              <label class="field full">Correo electrónico<input name="email" type="email" placeholder="tu@correo.cl" autocomplete="email"></label>
              <label class="check full"><input type="checkbox" checked>Quiero recibir novedades del Club Agatha</label>
            </div></section>
          <section class="co-card"><h2><i>2</i>Dirección de envío</h2>
            <div class="fields">
              <label class="field">Nombre<input name="nombre" placeholder="Camila" autocomplete="given-name"></label>
              <label class="field">Apellido<input placeholder="Rojas" autocomplete="family-name"></label>
              <label class="field">RUT<input placeholder="12.345.678-9"></label>
              <label class="field">Teléfono<input type="tel" placeholder="+56 9" autocomplete="tel"></label>
              <label class="field">Región<select>${REGIONES.map(r => `<option ${r === 'Biobío' ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
              <label class="field">Comuna<input placeholder="Concepción"></label>
              <label class="field full">Calle y número<input placeholder="Av. Ejemplo 1234" autocomplete="street-address"></label>
              <label class="field full">Depto, oficina u otras indicaciones (opcional)<input placeholder="Depto 402"></label>
            </div></section>
          <section class="co-card"><h2><i>3</i>Método de envío</h2>
            <div class="opts">${SHIP_OPTS.map(o => `${opt('ship', o, null, o.id === _ship, `<span class="opt-price" data-ship-price="${o.id}">${shipLabel(shipCost(o, sub))}</span>`)}</div>`).join('')}</div></section>
          <section class="co-card"><h2><i>4</i>Pago</h2>
            <div class="opts">${PAY_OPTS.map(o => `${opt('pay', o, o.icon, o.id === _pay)}${payPanels[o.id]}</div>`).join('')}</div>
            <label class="check" style="margin-top:20px"><input type="checkbox">Acepto los términos y condiciones y la política de privacidad</label></section>
        </form>
        <aside class="summary" aria-label="Resumen del pedido">
          <h2 class="h3" style="font-size:24px">Tu pedido</h2>
          <div class="mini-lines" id="co-lines">${miniLinesHTML()}</div>
          ${couponBox()}
          <div id="co-totals" class="totals">${totalsHTML(sub, shipOpt)}</div>
          <button class="btn btn-primary" type="submit" form="checkout-form" style="width:100%;justify-content:center">Realizar pedido</button>
          <button class="btn-link" data-go="carrito" style="align-self:center">← Volver al carrito</button>
          <ul class="trust"><li>${ic('lock', 'sm')}Pago seguro</li><li>${ic('repeat', 'sm')}Cambios sin costo hasta 30 días</li></ul>
        </aside>
      </div>
    </section>`;
  },

  confirmacion() {
    const o = store.get('agatha.lastOrder', null);
    if (!o) return `<section class="section bottom" style="display:flex;flex-direction:column;gap:32px"><div class="page-head">${crumb('Pedido')}<h1 class="h1">Pedido confirmado</h1></div>
      <div class="cart-empty">${ic('box', 'lg')}<div class="t">No hay un pedido reciente</div><p class="muted">Haz una compra de ejemplo para ver esta pantalla.</p><button class="btn btn-primary btn-sm" data-go="productos">Ver productos</button></div></section>`;
    return `
    <section class="section bottom" style="display:flex;flex-direction:column;gap:48px">
      <div class="page-head center" style="padding-top:16px">
        <div class="circle ok">${ic('check', 'lg')}</div>
        <div class="eyebrow" style="margin:0">Pedido ${o.num}</div>
        <h1 class="h1 it">¡Gracias por tu compra!</h1>
        <p class="lead" style="max-width:52ch">Te enviamos el comprobante a <b style="color:var(--cacao);font-weight:500">${o.email}</b>. Cada pieza va en caja Agatha, lista para regalar.</p>
      </div>
      <ol class="steps-bar" aria-label="Progreso"><li class="done"><span>${ic('check', 'sm')}</span>Carrito</li><li class="done"><span>${ic('check', 'sm')}</span>Datos y pago</li><li class="done"><span>${ic('check', 'sm')}</span>Confirmación</li></ol>
      <div class="cart-layout">
        <div class="co-card"><h2 style="margin-bottom:8px">Detalle del pedido</h2>
          <div class="mini-lines">${o.lines.map(l => `<div class="mini">
            <div class="thumb sm">${image(l.id, l.photo, 'r-1')}<span class="q">${l.qty}</span></div>
            <div class="mini-info"><div class="prod-name" style="font-size:16px">${l.name}</div><div class="prod-cat">${l.cat}</div></div><b>${fmt(l.price * l.qty)}</b></div>`).join('')}</div>
          <div class="totals" style="margin-top:16px">
            <div class="row"><span>Subtotal</span><span>${fmt(o.sub)}</span></div>
            <div class="row"><span>Envío</span><span>${shipLabel(o.ship)}</span></div>
            <div class="row total"><span>Total</span><span>${fmt(o.sub + o.ship)}</span></div></div>
        </div>
        <aside class="summary">
          <h2 class="h3" style="font-size:24px">Resumen</h2>
          <dl class="bank"><dt>Fecha</dt><dd>${o.date}</dd><dt>Pago</dt><dd>${o.pay}</dd><dt>Envío</dt><dd>${o.shipName}</dd><dt>Entrega a</dt><dd>${o.name}</dd></dl>
          <ul class="timeline"><li><b>Preparamos tu pedido</b><span>Revisamos y empacamos cada pieza.</span></li><li><b>Lo despachamos</b><span>Recibirás el número de seguimiento por correo.</span></li><li><b>Lo recibes</b><span>En el plazo indicado para tu comuna.</span></li></ul>
          <button class="btn btn-primary" data-go="productos" style="width:100%;justify-content:center">Seguir comprando</button>
          <a class="btn btn-gold btn-sm" href="https://wa.me/56912345678" target="_blank" rel="noopener" style="width:100%;justify-content:center">Escribirnos por WhatsApp</a>
        </aside>
      </div>
    </section>`;
  },
};

const miniLinesHTML = () => cartLines().map(l => `<div class="mini">
  <div class="thumb sm">${image(l.p.id, l.p.photo, 'r-1')}<span class="q">${l.qty}</span></div>
  <div class="mini-info"><div class="prod-name" style="font-size:16px">${l.p.name}</div><div class="prod-cat">${l.p.cat}</div></div>
  <b>${fmt(l.p.price * l.qty)}</b></div>`).join('');

function refreshCheckoutSummary() {
  const sub = cartSubtotal(), shipOpt = SHIP_OPTS.find(o => o.id === _ship);
  const lines = $('#co-lines'); if (lines) lines.innerHTML = miniLinesHTML();
  const box = $('#co-totals'); if (box) box.innerHTML = totalsHTML(sub, shipOpt);
  document.querySelectorAll('[data-ship-price]').forEach(el => { el.textContent = shipLabel(shipCost(SHIP_OPTS.find(o => o.id === el.dataset.shipPrice), sub)); });
}

// ---------- Eventos ----------
document.addEventListener('click', e => {
  if (e.target.closest('#drawer [data-go]')) closeDrawer();
  const el = e.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset;
  if (d.act === 'drawer-close') closeDrawer();
  else if (d.act === 'qty') cartSet(d.id, (cartAll()[d.id] || 0) + +d.d);
  else if (d.act === 'cart-remove') cartSet(d.id, 0);
});

document.addEventListener('change', e => {
  const act = e.target.dataset && e.target.dataset.act;
  if (act === 'ship') { _ship = e.target.value; refreshCheckoutSummary(); }
  else if (act === 'pay') _pay = e.target.value;
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.dataset && f.dataset.act === 'coupon') { e.preventDefault(); f.reset(); toast('Cupón de ejemplo: en este boceto no cambia el total'); }
  else if (f.id === 'checkout-form') {
    e.preventDefault();
    const sub = cartSubtotal(), shipOpt = SHIP_OPTS.find(o => o.id === _ship);
    store.set('agatha.lastOrder', {
      num: 'AG-' + String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0') + '-26',
      date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
      email: f.elements.email.value.trim() || 'tu correo',
      name: (f.elements.nombre.value.trim() || 'Clienta Agatha'),
      pay: PAY_OPTS.find(o => o.id === _pay).name, shipName: shipOpt.name,
      sub, ship: shipCost(shipOpt, sub),
      lines: cartLines().map(l => ({ id: l.p.id, name: l.p.name, cat: l.p.cat, photo: l.p.photo, price: l.p.price, qty: l.qty })),
    });
    _cart = {}; cartSave();          // el pedido "se paga": el carrito queda vacío
    go('confirmacion');
  }
});

document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });
window.addEventListener('hashchange', () => closeDrawer());
