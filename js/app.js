/* ==========================================================
   Agatha Accesorios — lógica de la tienda (vanilla JS)
   - Navegación por hash (#/inicio, #/productos, ...)
   - Estado en memoria; carrito y favoritos se guardan en localStorage
   - Es un boceto educativo: no hay backend ni pagos reales
   ========================================================== */

// ---------- Utilidades ----------
const $ = (sel, root = document) => root.querySelector(sel);
const fmt = n => '$' + n.toLocaleString('es-CL').replace(/,/g, '.');
const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ---------- Estado ----------
const PER_PAGE = 6;
const state = {
  favs: store.get('agatha.favs', {}),
  cats: [], cols: [], mats: [], prices: [],   // filtros de productos
  q: '', sort: 'vendidos', pg: 1,
  blogTag: 'Todos', blogMore: false,
  faq: 0, formSent: false, subscribed: false,
  filtersOpen: false,   // panel de filtros desplegado (solo se nota en móvil/tablet)
};

const NAV = [['inicio', 'Inicio'], ['nosotros', 'Nosotros'], ['productos', 'Productos'], ['colecciones', 'Colecciones'], ['blog', 'Blog'], ['contacto', 'Contacto']];
const PRICE_RANGES = {
  'Hasta $15.000': p => p <= 15000,
  '$15.000 – $20.000': p => p > 15000 && p <= 20000,
  'Más de $20.000': p => p > 20000,
};

// ---------- Bloques reutilizables ----------
let phCount = 0;
function image(id, caption, ratio, opts = {}) {
  const v = opts.dark ? 'dark' : ['', 'v2', 'v3'][phCount++ % 3];
  // plain: marcador sin ícono ni texto (hero). eager: carga la foto sin esperar al scroll
  const ph = opts.plain ? `<div class="ph ${v}"></div>`
    : `<div class="ph ${v}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.gem}</svg><span>${caption}</span></div>`;
  return `<div class="frame ${ratio}">
    ${ph}
    <img src="img/${id}.jpg" alt="${caption}" loading="${opts.eager ? 'eager' : 'lazy'}" ${opts.eager ? 'fetchpriority="high"' : ''} onload="this.classList.add('loaded')" onerror="this.remove()">
    ${opts.inner || ''}
  </div>`;
}
const arrowBtn = (label, cls, attrs) => `<button class="btn ${cls}" ${attrs}>${label}${ic('arrow', 'sm')}</button>`;
const sectionHead = (eyebrow, title, btn = '') => `<div class="sec-head"><div><div class="eyebrow">${eyebrow}</div><h2 class="h2">${title}</h2></div>${btn}</div>`;
const playIcon = big => `<div class="play ${big ? 'big' : ''}"><svg viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg></div>`;

function benefits() {
  return `<section class="benefits"><div class="benefits-in">${BENEFITS.map(b =>
    `<div class="benefit">${ic(b.icon, 'lg')}<div><b>${b.title}</b><span>${b.sub}</span></div></div>`).join('')}</div></section>`;
}

function productCard(p) {
  const fav = !!state.favs[p.id];
  const tag = p.soldOut ? '' : p.tag ? `<span class="prod-tag">${p.tag}</span>` : '';
  const inner = `<a class="frame-link" href="#/producto/${p.id}" aria-label="Ver ${p.name}"><span class="quick">Ver detalle</span></a>${tag}<button class="fav ${fav ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Quitar de' : 'Agregar a'} favoritos">${ic('heart', 'sm')}</button>`;
  const action = p.soldOut
    ? `<button class="btn btn-sm" disabled>Agotado</button>`
    : `<button class="btn btn-sm btn-add" data-act="add" data-id="${p.id}">Agregar al carrito</button>`;
  return `<article class="prod">
    ${image(p.id, p.photo, 'r-1', { inner })}
    <div class="prod-cat">${p.cat}</div><div class="prod-name"><a href="#/producto/${p.id}">${p.name}</a></div><div class="prod-price">${fmt(p.price)}</div>${action}
  </article>`;
}

function postCard(b, withTag) {
  return `<article class="post">
    ${image('blog-' + b.id, b.photo, 'r-1610', { inner: b.video ? playIcon() : '' })}
    ${withTag ? `<span class="tag-line">${b.tag}</span>` : ''}
    <div class="post-title">${b.title}</div><div class="post-time">${b.time}</div>
    <button class="btn-link" data-act="read">${withTag ? 'Leer más →' : 'Leer más'}</button>
  </article>`;
}

const crumb = name => `<div class="crumb"><a href="#/inicio">Inicio</a> / ${name}</div>`;

// ---------- Páginas ----------
const pages = {
  inicio() {
    return `
    <section class="hero">
      <div class="hero-text">
        <div class="hero-eyebrow">Más que joyas<i></i></div>
        <h1>Pequeños detalles, grandes historias</h1>
        <p class="hero-sub">Joyas que te acompañan en cada etapa</p>
        <div class="hero-cta">
          ${arrowBtn('Ver colección', 'btn-primary', 'data-go="productos"')}
          <button class="btn" data-go="nosotros">Conócenos</button>
        </div>
      </div>
      <div class="hero-img">
        ${image('hero', 'Modelo con collar y aros dorados', '', { dark: true, plain: true, eager: true })}
        <div class="hero-fade"></div>
        <div class="hero-words"><span>ELEGANCIA</span><span>AUTENTICIDAD</span><span>TU ESENCIA</span></div>
      </div>
    </section>
    ${benefits()}

    <section class="section top">
      ${sectionHead('Nuestras categorías', 'Descubre nuestras joyas', `<button class="btn btn-xs" data-act="cat" data-cat="">Ver todo</button>`)}
      <div class="grid-cat">${CATEGORIES.map(c => `
        <div class="cat-card">${image('cat-' + c.id, c.photo, 'r-1')}
          <div class="cat-name">${c.name}</div>
          <button class="btn-mini" data-act="cat" data-cat="${c.cat}">Ver más</button>
        </div>`).join('')}</div>
    </section>

    <section class="section bottom">
      <div style="margin-bottom:32px"><div class="eyebrow">Línea de accesorios</div><h2 class="h2">Accesorios para completar tu look</h2></div>
      <div class="grid-acc">${ACCESSORIES.map(a => `<div class="acc-card">${image('acc-' + a.id, a.photo, 'r-1')}<div>${a.name}</div></div>`).join('')}</div>
    </section>

    <section class="band"><div class="split">
      ${image('momentos', 'Caja de regalo Agatha con collar, sobre tela de lino', 'r-43')}
      <div class="split-text">
        <div class="eyebrow" style="margin:0">Colección destacada</div>
        <h2 class="h2 it">Momentos especiales</h2>
        <p>Joyas pensadas para celebrar lo que importa: un cumpleaños, un logro o un “te quiero”. Vienen en caja Agatha, listas para regalar.</p>
        ${arrowBtn('Ver colección', 'btn-primary', 'data-act="col" data-col="Regalos" style="margin-top:8px"')}
      </div>
    </div></section>

    <section class="section top">
      ${sectionHead('Lo más nuevo', 'Nuestros productos', `<button class="btn btn-xs" data-act="cat" data-cat="">Ver todos</button>`)}
      <div class="grid-prod">${PRODUCTS.slice(0, 4).map(productCard).join('')}</div>
    </section>

    <section class="section" id="colecciones">
      ${sectionHead('Cuatro estilos', 'Nuestras colecciones', `<button class="btn btn-xs" data-act="cat" data-cat="">Ver colecciones</button>`)}
      <div class="grid-col">${COLLECTIONS.map(c => `
        <button class="col-card" data-act="col" data-col="${c.name}" aria-label="Ver colección ${c.name}">
          ${image('col-' + c.id, c.photo, '', { dark: true })}
          <div class="grad"></div>
          <div class="cap"><b>${c.name}</b><span>Ver colección →</span></div>
        </button>`).join('')}</div>
    </section>

    <section class="section bottom">
      ${sectionHead('Blog Agatha', 'Inspiración y cuidados', `<button class="btn btn-xs" data-go="blog">Ir al blog</button>`)}
      <div class="grid-posts">${POSTS.slice(0, 3).map(b => postCard(b, false)).join('')}</div>
    </section>`;
  },

  nosotros() {
    return `
    <section class="section page-head center" style="padding-bottom:0">
      ${crumb('Nosotros')}
      <div class="eyebrow" style="margin:0">Nosotros</div>
      <h1 class="h1">Nuestra <em>esencia</em></h1>
      <p class="lead" style="max-width:56ch;text-wrap:pretty">En Agatha Accesorios creemos en la belleza de lo simple. Creamos joyas diseñadas para mujeres reales, que valoran la elegancia, la autenticidad y los momentos que importan.</p>
    </section>
    <section class="section bottom">${image('nos-ambiente', 'Ambiente amplio · joyas sobre piedra y tela clara, luz natural', 'r-218')}</section>
    <section class="split section bottom" style="padding-top:0">
      ${image('nos-historia', 'Detalle · anillos sobre piedra con flores secas', 'r-43')}
      <div class="split-text">
        <div class="eyebrow" style="margin:0">Nuestra historia</div>
        <h2 class="h2">Un emprendimiento de Concepción hecho con detalle</h2>
        <p style="max-width:none">Agatha Accesorios es una nueva marca de joyería y accesorios femeninos, creada en Concepción, Chile, por la publicista Stephanie Muñoz.</p>
        <p style="max-width:none">Seleccionamos joyas y accesorios que combinen entre sí, con una estética delicada, para que cada pieza acompañe tu estilo personal.</p>
        ${arrowBtn('Ver colecciones', 'btn-sm', 'data-go="colecciones" style="margin-top:8px"')}
      </div>
    </section>
    <section class="values-wrap"><div class="values-in">
      <div class="center"><div class="eyebrow">Lo que nos mueve</div><h2 class="h2">Nuestros valores</h2></div>
      <div class="grid-3">${VALUES.map(v => `<div class="value"><div class="circle">${ic(v.icon, 'lg')}</div><h3 class="h3">${v.name}</h3><p>${v.text}</p></div>`).join('')}</div>
    </div></section>
    <section class="section top bottom" style="display:flex;flex-direction:column;gap:48px;padding-top:96px">
      <div class="center"><div class="eyebrow">Cómo trabajamos</div><h2 class="h2">De la idea a tus manos</h2></div>
      <div class="grid-steps">${STEPS.map(s => `<div class="step"><div class="n">${s.n}</div><h3>${s.name}</h3><p>${s.text}</p></div>`).join('')}</div>
    </section>
    <section class="section bottom" style="padding-top:0">
      <div class="cta-box">
        <div><h2 class="h2 it">Encuentra la pieza que va contigo</h2><p>Esencia, Naturaleza, Minimal y Ocasiones: una colección para cada estilo.</p></div>
        ${arrowBtn('Ver colecciones', 'btn-gold', 'data-go="colecciones"')}
      </div>
    </section>`;
  },

  productos() {
    const list = filterProducts();
    const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (state.pg > pageCount) state.pg = 1;
    const visible = list.slice((state.pg - 1) * PER_PAGE, state.pg * PER_PAGE);
    const chipCats = ['Collares', 'Aros', 'Anillos', 'Pulseras', 'Sets de regalo'];
    const chips = ['Todos', ...chipCats].map(l => {
      const on = l === 'Todos' ? state.cats.length === 0 : state.cats.length === 1 && state.cats[0] === l;
      return `<button class="chip ${on ? 'on' : ''}" data-act="chip" data-v="${l}">${l}</button>`;
    }).join('');
    const count = c => PRODUCTS.filter(p => p.cat === c).length;
    const groups = [
      { key: 'cats',   title: 'Categoría', items: ['Collares', 'Aros', 'Anillos', 'Pulseras'].map(c => [c, `${c} (${count(c)})`]) },
      { key: 'cols',   title: 'Colección', items: ['Esencia', 'Naturaleza', 'Minimal', 'Ocasiones', 'Regalos'].map(c => [c, c]) },
      { key: 'mats',   title: 'Material',  items: ['Baño de oro', 'Acero dorado', 'Perlas'].map(c => [c, c]) },
      { key: 'prices', title: 'Precio',    items: Object.keys(PRICE_RANGES).map(c => [c, c]) },
    ];
    const sorts = [['vendidos', 'Más vendidos'], ['menor', 'Precio: menor a mayor'], ['mayor', 'Precio: mayor a menor'], ['nuevos', 'Más nuevos']];
    return `
    <section class="section bottom" style="display:flex;flex-direction:column;gap:32px">
      <div class="page-head">${crumb('Productos')}
        <h1 class="h1">Nuestros productos</h1>
        <p class="muted">Collares, aros, anillos y pulseras para cada momento.</p>
      </div>
      <div class="chips">${chips}</div>
      <div class="layout">
        <aside class="filters ${state.filtersOpen ? 'open' : ''}" aria-label="Filtros">
          <button class="filters-title" data-act="toggle-filters" aria-expanded="${state.filtersOpen}">${ic('filter', 'sm')}Filtrar${ic('chev', 'sm chev')}</button>
          ${groups.map(g => `<div class="fgroup"><b>${g.title}</b>${g.items.map(([v, label]) =>
            `<label><input type="checkbox" data-act="filter" data-key="${g.key}" data-v="${v}" ${state[g.key].includes(v) ? 'checked' : ''}>${label}</label>`).join('')}</div>`).join('')}
          <button class="btn btn-sm" data-act="clear">Limpiar filtros</button>
        </aside>
        <div class="results">
          <div class="results-bar">
            <div>${list.length} producto${list.length === 1 ? '' : 's'}${state.q ? ` para “${state.q}” · <a href="#/productos" data-act="clear-q" style="text-decoration:underline">quitar búsqueda</a>` : ''}</div>
            <select class="sel" data-act="sort" aria-label="Ordenar por">${sorts.map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>Ordenar por: ${l}</option>`).join('')}</select>
          </div>
          ${visible.length
            ? `<div class="grid-prod fill">${visible.map(productCard).join('')}</div>`
            : `<div class="empty">No encontramos productos con esos filtros.<br><button class="btn-link" data-act="clear" style="margin-top:12px">Limpiar filtros</button></div>`}
          ${pageCount > 1 ? `<div class="pager">${Array.from({ length: pageCount }, (_, i) => i + 1).map(n =>
            `<button class="${n === state.pg ? 'on' : ''}" data-act="page" data-n="${n}" aria-label="Página ${n}">${n}</button>`).join('')}</div>` : ''}
        </div>
      </div>
    </section>`;
  },

  blog() {
    const tags = ['Todos', 'Cuidado de joyas', 'Tendencias', 'Regalos', 'Videos'];
    const filtered = POSTS.filter(p => state.blogTag === 'Todos' || p.tag === state.blogTag);
    const shown = state.blogMore ? filtered : filtered.slice(0, 6);
    const hasMore = filtered.length > shown.length;
    return `
    <section class="section page-head center" style="padding-bottom:48px">
      ${crumb('Blog')}
      <div class="eyebrow" style="margin:0">Blog Agatha</div>
      <h1 class="h1">Inspiración, estilo <em>y cuidados</em></h1>
      <p class="lead">Guías, tendencias y videos para que tus joyas te acompañen por más tiempo.</p>
      <div class="chips" style="justify-content:center;margin-top:8px">${tags.map(t => `<button class="chip ${t === state.blogTag ? 'on' : ''}" data-act="blogtag" data-v="${t}">${t}</button>`).join('')}</div>
    </section>
    <section class="section bottom" style="padding-top:0">
      <div class="featured">
        ${image('blog-destacado', 'Video destacado · manos limpiando un anillo con paño (“Cuida lo que te hace brillar”)', 'r-1611', { inner: playIcon(true) })}
        <div>
          <span class="tag-fill">Destacado · Video</span>
          <h2 class="h2 it">Cuida lo que te hace brillar</h2>
          <p class="muted">Humedad, perfume y agua de mar: te contamos qué evitar, cómo guardar tus joyas y cada cuánto limpiarlas.</p>
          <div class="post-time">Por Equipo Agatha · 6 min</div>
          ${arrowBtn('Ver video', 'btn-primary', 'data-act="read"')}
        </div>
      </div>
    </section>
    <section class="section bottom" style="padding-top:0;display:flex;flex-direction:column;gap:32px">
      <div><div class="eyebrow">Últimas publicaciones</div><h2 class="h2">Artículos y videos</h2></div>
      <div class="grid-blog">${shown.map(b => postCard(b, true)).join('')}</div>
      ${hasMore ? `<button class="btn" data-act="blogmore" style="align-self:center">Cargar más artículos</button>` : ''}
    </section>`;
  },

  contacto() {
    return `
    <section class="section page-head center" style="padding-bottom:48px">
      ${crumb('Contacto')}
      <div class="eyebrow" style="margin:0">Contacto</div>
      <h1 class="h1 it">Hablemos</h1>
      <p class="lead" style="max-width:52ch">¿Tienes dudas sobre un producto, tu pedido o quieres asesoría para un regalo? Escríbenos.</p>
    </section>
    <section class="section channels" style="padding-top:0;padding-bottom:64px">${CHANNELS.map(c => `
      <div class="channel"><div class="circle sm">${ic(c.icon)}</div><div class="t">${c.title}</div><div class="v">${c.value}</div><div class="n">${c.note}</div></div>`).join('')}</section>
    <section class="section bottom contact-grid" style="padding-top:0">
      <form class="form" id="contact-form">
        <h2>Formulario de contacto</h2>
        <label>Nombre *<input required placeholder="Ej: Camila"></label>
        <label>Correo electrónico *<input required type="email" placeholder="tu@correo.cl"></label>
        <label>Teléfono<input placeholder="+56 9"></label>
        <label>Motivo *<select required><option value="">Selecciona una opción</option><option>Consulta sobre un producto</option><option>Estado de mi pedido</option><option>Cambios y devoluciones</option><option>Asesoría para regalo</option></select></label>
        <label class="full">Mensaje *<textarea required rows="5" placeholder="Cuéntanos en qué te podemos ayudar"></textarea></label>
        <label class="full check"><input type="checkbox" required>Acepto la política de privacidad</label>
        <div class="form-actions">
          ${arrowBtn('Enviar mensaje', 'btn-primary', 'type="submit"')}
          ${state.formSent ? `<span class="form-ok" role="status">Gracias, te responderemos en menos de 24 h.</span>` : ''}
        </div>
      </form>
      <div class="faq-col">
        <div class="wa-box">${ic('chat')}<div>
          <div class="t">¿Prefieres una respuesta rápida?</div>
          <p>Escríbenos por WhatsApp y te asesoramos al tiro.</p>
          <a class="btn btn-sm btn-gold" href="https://wa.me/56912345678" target="_blank" rel="noopener" style="margin-top:8px">Abrir WhatsApp</a>
        </div></div>
        <div class="faq"><h2>Preguntas frecuentes</h2>${FAQS.map((f, i) => `
          <div class="faq-item"><button class="faq-q" data-act="faq" data-i="${i}" aria-expanded="${state.faq === i}">${f.q}<span>${state.faq === i ? '−' : '+'}</span></button>
          ${state.faq === i ? `<p class="faq-a">${f.a}</p>` : ''}</div>`).join('')}</div>
      </div>
    </section>`;
  },
};

// ---------- Filtros de productos ----------
function filterProducts() {
  const q = state.q.trim().toLowerCase();
  let list = PRODUCTS.filter(p =>
    (!state.cats.length || state.cats.includes(p.cat)) &&
    (!state.cols.length || state.cols.includes(p.col)) &&
    (!state.mats.length || state.mats.includes(p.mat)) &&
    (!state.prices.length || state.prices.some(r => PRICE_RANGES[r](p.price))) &&
    (!q || [p.name, p.cat, p.col, p.mat].some(t => t.toLowerCase().includes(q))));
  const idx = p => PRODUCTS.indexOf(p);
  if (state.sort === 'menor') list.sort((a, b) => a.price - b.price);
  else if (state.sort === 'mayor') list.sort((a, b) => b.price - a.price);
  else if (state.sort === 'nuevos') list.sort((a, b) => (b.tag === 'Nuevo') - (a.tag === 'Nuevo') || idx(b) - idx(a));
  else list.sort((a, b) => (b.tag === 'Más vendido') - (a.tag === 'Más vendido') || idx(a) - idx(b));
  return list;
}
function resetFilters() { Object.assign(state, { cats: [], cols: [], mats: [], prices: [], q: '', pg: 1 }); }

// ---------- Cabecera, pie y render ----------
function renderChrome() {
  const route = currentRoute();
  $('#nav').innerHTML = NAV.map(([k, l]) => `<a href="#/${k}" class="${k === route ? 'active' : ''}" ${k === route ? 'aria-current="page"' : ''}>${l}</a>`).join('');
  const favCount = Object.values(state.favs).filter(Boolean).length;
  $('#tools').innerHTML = `
    <button class="tool" data-act="search" aria-label="Buscar">${ic('search')}</button>
    <button class="tool" data-act="account" aria-label="Mi cuenta">${ic('user')}</button>
    <button class="tool" data-act="favs" aria-label="Favoritos (${favCount})">${ic('heart')}${favCount ? `<span class="badge gold">${favCount}</span>` : ''}</button>
    <button class="tool" data-act="cart" aria-label="Carrito (${cartCount()})">${ic('bag')}<span class="badge rosa">${cartCount()}</span></button>
    <button class="tool menu-btn" data-act="menu" aria-label="Menú" aria-expanded="${$('#header').classList.contains('open')}">${ic('menu')}</button>`;
  if (typeof motionChrome === 'function') motionChrome();
}

function renderFooter() {
  const link = (txt, href, extra = '') => `<a href="${href}" ${extra}>${txt}</a>`;
  $('#footer').innerHTML = `
    <div class="foot-in">
      <div><div class="foot-logo"><b>AGATHA</b><small>ACCESORIOS</small></div>
        <p style="margin:0">Pequeños detalles, grandes historias. Concepción, Chile.</p>
        <div class="foot-social"><a href="https://instagram.com/agathaaccesorios" target="_blank" rel="noopener" aria-label="Instagram">${ic('ig')}</a><a href="https://wa.me/56912345678" target="_blank" rel="noopener" aria-label="WhatsApp">${ic('chat')}</a><a href="mailto:hola@agathaaccesorios.cl" aria-label="Correo">${ic('mail')}</a></div></div>
      <div><h4>TIENDA</h4>${['Collares', 'Aros', 'Anillos', 'Pulseras'].map(c => `<a href="#/productos" data-act="cat" data-cat="${c}">${c}</a>`).join('')}</div>
      <div><h4>AYUDA</h4>${['Envíos y plazos', 'Cambios y devoluciones', 'Cuidado de joyas', 'Preguntas frecuentes'].map(t => link(t, '#/contacto')).join('')}</div>
      <div><h4>AGATHA</h4>${link('Nosotros', '#/nosotros')}${link('Blog', '#/blog')}${link('Contacto', '#/contacto')}${link('Términos y privacidad', '#/contacto')}</div>
    </div>
    <div class="foot-bottom"><span>© 2026 Agatha Accesorios</span><span>Webpay · Mercado Pago · Transferencia</span></div>`;
}

function currentRoute() {
  const r = (location.hash.replace(/^#\/?/, '').split('?')[0]) || 'inicio';
  if (r.startsWith('producto/')) return 'producto';          // ficha: #/producto/<id>
  return ['inicio', 'nosotros', 'productos', 'colecciones', 'blog', 'contacto', 'carrito', 'checkout', 'confirmacion'].includes(r) ? r : 'inicio';
}
const currentProduct = () => PRODUCTS.find(p => p.id === decodeURIComponent(location.hash.replace(/^#\/?producto\//, '').split('?')[0]));

const TITLES = { inicio: 'Pequeños detalles, grandes historias', nosotros: 'Nosotros', productos: 'Productos', colecciones: 'Colecciones', blog: 'Blog', contacto: 'Contacto', carrito: 'Tu carrito', checkout: 'Checkout', confirmacion: 'Pedido confirmado' };

function render(scroll) {
  const route = currentRoute();
  const page = route === 'colecciones' ? 'inicio' : route;
  phCount = 0;
  // Barra de beneficios bajo el header en páginas internas (en Inicio va bajo el hero)
  const inner = page !== 'inicio' && !['checkout', 'confirmacion'].includes(page) ? benefits() : '';
  document.body.dataset.route = route;   // el CSS oculta el newsletter en checkout
  $('#app').innerHTML = inner + pages[page]();
  document.title = `${route === 'producto' ? (currentProduct() || {}).name || 'Producto' : TITLES[route]} · Agatha Accesorios`;
  renderChrome();
  if (scroll === 'top') window.scrollTo({ top: 0, behavior: 'instant' });
  if (typeof motionInit === 'function') motionInit(scroll);   // animaciones (js/motion.js)
  if (route === 'colecciones' && scroll === 'top') {
    setTimeout(() => { const el = $('#colecciones'); el && window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' }); }, 50);
  }
}

function go(route) { location.hash = '#/' + route; if (currentRoute() === route) render('top'); }

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------- Eventos (delegación) ----------
document.addEventListener('click', e => {
  const goEl = e.target.closest('[data-go]');
  if (goEl) { e.preventDefault(); $('#header').classList.remove('open'); return go(goEl.dataset.go); }
  const el = e.target.closest('[data-act]');
  if (!el) { if (e.target.closest('.nav a')) $('#header').classList.remove('open'); return; }
  const d = el.dataset;
  switch (d.act) {
    case 'hide-announce': $('#announce').remove(); break;
    case 'menu': $('#header').classList.toggle('open'); renderChrome(); break;
    case 'search': { const bar = $('#searchbar'); bar.hidden = !bar.hidden; if (!bar.hidden) $('#search-input').focus(); break; }
    case 'account': toast('Mi cuenta: no disponible en este boceto'); break;
    case 'favs': toast(Object.values(state.favs).filter(Boolean).length ? 'Tus favoritos quedan guardados en este navegador' : 'Aún no tienes favoritos'); break;
    case 'cart': openDrawer(); break;
    case 'fav': {
      state.favs[d.id] = !state.favs[d.id]; store.set('agatha.favs', state.favs);
      el.classList.toggle('on', state.favs[d.id]); el.setAttribute('aria-pressed', state.favs[d.id]);
      renderChrome(); break;
    }
    // El producto "vuela" hasta la bolsa y recién ahí se agrega y se abre el panel
    case 'add': flyToCart(el, () => { cartAdd(d.id); openDrawer(); }); break;
    case 'cat': e.preventDefault(); resetFilters(); if (d.cat) state.cats = [d.cat]; go('productos'); break;
    case 'col': resetFilters(); state.cols = [d.col]; go('productos'); break;
    case 'toggle-filters': state.filtersOpen = !state.filtersOpen; render(); break;
    case 'chip': state.cats = d.v === 'Todos' ? [] : [d.v]; state.pg = 1; render(); break;
    case 'clear': resetFilters(); render(); break;
    case 'clear-q': e.preventDefault(); state.q = ''; render(); break;
    case 'page': state.pg = +d.n; render('top'); break;
    case 'blogtag': state.blogTag = d.v; state.blogMore = false; render(); break;
    case 'blogmore': state.blogMore = true; render(); break;
    case 'faq': state.faq = state.faq === +d.i ? -1 : +d.i; render(); break;
    case 'read': toast('Contenido del blog: pendiente en este boceto'); break;
  }
});

document.addEventListener('change', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  if (el.dataset.act === 'filter') {
    const arr = state[el.dataset.key], v = el.dataset.v;
    state[el.dataset.key] = el.checked ? [...arr, v] : arr.filter(x => x !== v);
    state.pg = 1; render();
  } else if (el.dataset.act === 'sort') { state.sort = el.value; state.pg = 1; render(); }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'contact-form') { e.preventDefault(); state.formSent = true; render(); }
  else if (e.target.id === 'news-form') {
    e.preventDefault(); state.subscribed = true; $('#news-btn').textContent = '¡Listo!'; e.target.reset();
  } else if (e.target.id === 'search-form') {
    e.preventDefault(); resetFilters(); state.q = $('#search-input').value; $('#searchbar').hidden = true; go('productos');
  }
});

window.addEventListener('hashchange', () => render('top'));

// ---------- Inicio ----------
Object.assign(pages, CART_PAGES);      // carrito, checkout y confirmación (js/cart.js)
Object.assign(pages, PRODUCT_PAGES);   // ficha de producto (js/product.js)
$('#x-ic').innerHTML = ICONS.close;
$('#wa-float').innerHTML = ic('chat');
renderFooter();
render('top');
