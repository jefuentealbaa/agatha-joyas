/* ==========================================================
   Ficha de producto  (#/producto/<id>)
   Una sola plantilla que se reutiliza para todos los productos de
   data.js: nombre, precio, descripción y especificaciones salen de
   PRODUCTS, PRODUCT_INFO y CAT_INFO. Se carga antes de app.js.
   ========================================================== */

const PRODUCT_PAGES = {
  producto() {
    const p = currentProduct();
    if (!p) {
      return `<section class="section bottom" style="display:flex;flex-direction:column;gap:32px">
        <div class="page-head">${crumb('Producto')}<h1 class="h1">Producto no encontrado</h1></div>
        <div class="cart-empty">${ic('gem', 'lg')}<div class="t">No encontramos esa joya</div>
        <button class="btn btn-primary btn-sm" data-go="productos">Ver productos</button></div></section>`;
    }
    const info = PRODUCT_INFO[p.id] || { desc: p.photo + '.', uso: '' };
    const cat = CAT_INFO[p.cat] || {};
    const fav = !!state.favs[p.id];
    const wa = 'https://wa.me/56912345678?text=' + encodeURIComponent(`Hola! Quiero consultar por ${p.name}`);
    const related = [...PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat), ...PRODUCTS.filter(x => x.id !== p.id && x.cat !== p.cat)].slice(0, 4);
    const detail = (title, body, open) => `<details class="acc" ${open ? 'open' : ''}><summary>${title}<span aria-hidden="true"></span></summary><div class="acc-body">${body}</div></details>`;

    const options = cat.opciones ? `
      <div class="pd-opt"><div class="pd-label">${cat.opcionLabel}: <b data-opt-label>${cat.opciones[1] || cat.opciones[0]}</b></div>
        <div class="chips" role="radiogroup" aria-label="${cat.opcionLabel}">${cat.opciones.map((o, i) =>
          `<button class="chip ${i === (cat.opciones[1] ? 1 : 0) ? 'on' : ''}" role="radio" data-act="pd-opt" data-v="${o}" aria-checked="${i === (cat.opciones[1] ? 1 : 0)}">${o}</button>`).join('')}</div></div>` : '';

    const buy = p.soldOut ? `
      <div class="pd-soldout"><b>Agotado por ahora</b><p class="muted" style="font-size:13px">Déjanos tu correo y te avisamos cuando vuelva.</p>
        <form class="coupon" data-act="notify"><input type="email" placeholder="tu@correo.cl" aria-label="Correo para aviso"><button class="btn btn-sm" type="submit">Avísame</button></form></div>` : `
      <div class="pd-buy">
        <div class="qty" role="group" aria-label="Cantidad">
          <button data-act="pd-qty" data-d="-1" aria-label="Menos">${ic('minus', 'sm')}</button>
          <span id="pd-qty" aria-live="polite">1</span>
          <button data-act="pd-qty" data-d="1" aria-label="Más">${ic('plus', 'sm')}</button></div>
        <button class="btn btn-primary pd-add" data-act="pd-add" data-id="${p.id}">Agregar al carrito</button>
        <button class="btn pd-fav ${fav ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Quitar de' : 'Agregar a'} favoritos">${ic('heart')}</button>
      </div>
      <button class="btn btn-sm pd-now" data-act="pd-buy" data-id="${p.id}">Comprar ahora</button>`;

    return `
    <section class="section pd-wrap">
      <div class="crumb pd-crumb"><a href="#/inicio">Inicio</a> / <a href="#/productos" data-act="cat" data-cat="">Productos</a> / <a href="#/productos" data-act="cat" data-cat="${p.cat}">${p.cat}</a> / ${p.name}</div>
      <div class="pd">
        <div class="pd-media">
          ${image(p.id, p.photo, 'r-1', { inner: p.tag && !p.soldOut ? `<span class="prod-tag">${p.tag}</span>` : '' })}
          <div class="pd-hint">Pasa el cursor para ampliar</div>
        </div>
        <div class="pd-info">
          <div class="eyebrow" style="margin:0">${p.cat} · Colección ${p.col}</div>
          <h1 class="h2 pd-name">${p.name}</h1>
          <div class="pd-price"><span>${fmt(p.price)}</span><small>IVA incluido</small></div>
          <div class="pd-stock ${p.soldOut ? 'out' : ''}"><i></i>${p.soldOut ? 'Sin stock' : 'En stock · despacho en 24 h hábiles'}</div>
          <p class="pd-desc">${info.desc} ${info.uso}</p>
          ${options}
          ${buy}
          <ul class="pd-perks">
            <li>${ic('truck', 'sm')}Envío a todo Chile con seguimiento</li>
            <li>${ic('repeat', 'sm')}Cambios sin costo hasta 30 días</li>
            <li>${ic('box', 'sm')}Llega en caja Agatha, lista para regalar</li>
          </ul>
          <div class="pd-accs">
            ${detail('Detalles', `<dl class="bank"><dt>Material</dt><dd>${p.mat}</dd><dt>Colección</dt><dd>${p.col}</dd><dt>Medidas</dt><dd>${cat.medidas || '—'}</dd><dt>Código</dt><dd>AG-${p.id.toUpperCase().replace(/-/g, '').slice(0, 8)}</dd></dl>`, true)}
            ${detail('Cuidados', '<p>Evita el contacto con perfume, agua de mar y humedad. Guárdala por separado, en su bolsita, y límpiala con un paño suave y seco.</p>')}
            ${detail('Envíos y cambios', '<p>Despachamos a todo Chile con seguimiento (2 a 4 días hábiles). Tienes 30 días para cambiar tu producto sin costo; escríbenos con tu número de pedido.</p>')}
          </div>
          <a class="pd-wa" href="${wa}" target="_blank" rel="noopener">${ic('chat', 'sm')}¿Dudas? Consúltanos por WhatsApp</a>
        </div>
      </div>
    </section>
    <section class="section bottom" style="padding-top:0">
      ${sectionHead('Sigue explorando', 'También te puede gustar', `<button class="btn btn-xs" data-act="cat" data-cat="">Ver todos</button>`)}
      <div class="grid-prod">${related.map(productCard).join('')}</div>
    </section>`;
  },
};

// ---------- Interacciones de la ficha ----------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset;
  if (d.act === 'pd-qty') {
    const n = $('#pd-qty'); n.textContent = Math.max(1, Math.min(9, +n.textContent + +d.d));
  } else if (d.act === 'pd-opt') {
    const group = el.parentElement;
    group.querySelectorAll('.chip').forEach(c => { c.classList.toggle('on', c === el); c.setAttribute('aria-checked', c === el); });
    const label = el.closest('.pd-opt').querySelector('[data-opt-label]'); if (label) label.textContent = d.v;
  } else if (d.act === 'pd-add') {
    const qty = +$('#pd-qty').textContent;
    flyToCart(el, () => { cartAdd(d.id, qty); openDrawer(); });
  } else if (d.act === 'pd-buy') {
    cartAdd(d.id, +$('#pd-qty').textContent); go('checkout');
  }
});

document.addEventListener('submit', e => {
  if (e.target.dataset && e.target.dataset.act === 'notify') {
    e.preventDefault(); e.target.reset(); toast('Listo, te avisaremos cuando esté disponible');
  }
});
