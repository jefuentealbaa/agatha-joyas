/* ==========================================================
   Datos de ejemplo (en un proyecto real vendrían de una API/CMS).
   Para usar fotos reales: guarda el archivo en /img con el mismo
   id, por ejemplo img/collar-estrella.jpg, y se mostrará solo.
   ========================================================== */

const PRODUCTS = [
  { id: 'collar-estrella', cat: 'Collares', col: 'Esencia',    mat: 'Baño de oro',   name: 'Collar Estrella',      price: 18990, tag: 'Nuevo',       photo: 'Collar dorado con medalla estrella sobre tela' },
  { id: 'aros-argolla',    cat: 'Aros',     col: 'Minimal',    mat: 'Baño de oro',   name: 'Aros Argolla Dorada',  price: 14990,                        photo: 'Argollas doradas sobre fondo nude' },
  { id: 'anillos-duo',     cat: 'Anillos',  col: 'Ocasiones',  mat: 'Acero dorado',  name: 'Anillos Brillo Duo',   price: 16990,                        photo: 'Dos anillos con circones sobre piedra' },
  { id: 'pulsera-perla',   cat: 'Pulseras', col: 'Esencia',    mat: 'Perlas',        name: 'Pulsera Perla Estrella', price: 15990, tag: 'Más vendido', photo: 'Pulsera de perlas con dije estrella' },
  { id: 'collar-luz',      cat: 'Collares', col: 'Naturaleza', mat: 'Acero dorado',  name: 'Collar Luz',           price: 16990,                        photo: 'Collar con colgante de cristal sobre lino' },
  { id: 'aros-hoja',       cat: 'Aros',     col: 'Naturaleza', mat: 'Baño de oro',   name: 'Aros Hoja',            price: 14990, tag: 'Nuevo',       photo: 'Aros dorados en forma de hoja' },
  { id: 'anillos-minimal', cat: 'Anillos',  col: 'Minimal',    mat: 'Baño de oro',   name: 'Anillos Minimal',      price: 16990,                        photo: 'Anillos finos dorados entrelazados' },
  { id: 'aros-perla',      cat: 'Aros',     col: 'Ocasiones',  mat: 'Perlas',        name: 'Aros Perla Gota',      price: 15990, soldOut: true,         photo: 'Aros de perla gota sobre piedra' },
  { id: 'pulsera-finas',   cat: 'Pulseras', col: 'Minimal',    mat: 'Perlas',        name: 'Pulsera Perlas Finas', price: 15990,                        photo: 'Pulsera de perlas finas y cadena dorada' },
  { id: 'set-regalo-esencia', cat: 'Sets de regalo', col: 'Regalos', mat: 'Baño de oro', name: 'Set Esencia (collar + aros)', price: 29990, tag: 'Nuevo', photo: 'Set de collar y aros en caja Agatha' },
  { id: 'set-regalo-perlas',  cat: 'Sets de regalo', col: 'Regalos', mat: 'Perlas',      name: 'Set Perlas (pulsera + aros)', price: 27990,               photo: 'Set de perlas en caja Agatha' },
  { id: 'collar-capas',    cat: 'Collares', col: 'Ocasiones',  mat: 'Baño de oro',   name: 'Collar Doble Capa',    price: 21990,                        photo: 'Collar de doble cadena dorada' },
];

// Contenido de la ficha de cada producto (textos de ejemplo, a validar con la marca)
const PRODUCT_INFO = {
  'collar-estrella':    { desc: 'Una delicada medalla en forma de estrella que cae justo sobre la clavícula. Se siente ligera y combina con todo.', uso: 'Ideal para el día a día y para combinar en capas.' },
  'aros-argolla':       { desc: 'Argollas doradas de acabado pulido, ni muy grandes ni muy pequeñas. El básico que va con cualquier look.', uso: 'Perfectas para la oficina, la universidad o una salida.' },
  'anillos-duo':        { desc: 'Dos anillos con pequeños circones que brillan sin exagerar. Se usan juntos o por separado.', uso: 'Un detalle luminoso para ocasiones especiales.' },
  'pulsera-perla':      { desc: 'Pulsera de perlas con un dije de estrella. Clásica con un toque de juego.', uso: 'Un favorito para regalar: viene en caja Agatha.' },
  'collar-luz':         { desc: 'Colgante de cristal que atrapa la luz y suma un brillo suave a tu escote.', uso: 'Para looks simples que necesitan un punto focal.' },
  'aros-hoja':          { desc: 'Aros dorados con forma de hoja, livianos y con movimiento. Inspirados en la colección Naturaleza.', uso: 'Se lucen con el pelo recogido.' },
  'anillos-minimal':    { desc: 'Anillos finos y entrelazados, de líneas limpias. Apílalos para crear tu propio diseño.', uso: 'El minimalismo hecho joya.' },
  'aros-perla':         { desc: 'Aros de perla en forma de gota, con un brillo nacarado y elegante.', uso: 'Para matrimonios, cenas y celebraciones.' },
  'pulsera-finas':      { desc: 'Perlas finas combinadas con cadena dorada, delicada y fácil de combinar con relojes.', uso: 'Úsala sola o junto a otras pulseras.' },
  'set-regalo-esencia': { desc: 'Collar y aros a juego, listos para regalar en caja Agatha con lazo.', uso: 'Un regalo que siempre acierta.' },
  'set-regalo-perlas':  { desc: 'Pulsera y aros de perlas en un set coordinado, presentados en caja Agatha.', uso: 'Cumpleaños, aniversarios y días especiales.' },
  'collar-capas':       { desc: 'Doble cadena dorada que logra el efecto de capas en una sola pieza, sin enredos.', uso: 'Para quienes aman el layering sin complicarse.' },
};
// Especificaciones por categoría (valores de ejemplo)
const CAT_INFO = {
  'Collares':       { medidas: 'Largo 45 cm + extensión de 5 cm',       opciones: ['40 cm', '45 cm', '50 cm'], opcionLabel: 'Largo' },
  'Aros':           { medidas: 'Aprox. 2,5 cm de alto',                 opciones: null },
  'Anillos':        { medidas: 'Tallas 12 a 16 (ajustables)',           opciones: ['12', '13', '14', '15', '16'], opcionLabel: 'Talla' },
  'Pulseras':       { medidas: 'Ajustable de 16 a 19 cm',               opciones: null },
  'Sets de regalo': { medidas: 'Incluye 2 piezas en caja Agatha',       opciones: null },
};

const POSTS = [
  { id: 'limpiar',        tag: 'Cuidado de joyas', title: 'Cómo limpiar tus joyas doradas en casa',       time: '4 min de lectura', photo: 'Collar dorado sobre piedra clara, luz suave' },
  { id: 'layering',       tag: 'Tendencias',       title: 'Layering: cómo combinar collares en capas',    time: '5 min de lectura', photo: 'Flat lay de varios collares y anillos dorados' },
  { id: 'mas-que-joyas',  tag: 'Videos',           title: 'Más que joyas: nuestra historia',              time: 'Video · 2 min',    video: true, photo: 'Modelo de espalda al atardecer (video “Más que joyas”)' },
  { id: 'regalos',        tag: 'Regalos',          title: 'Guía de regalos según su estilo',              time: '6 min de lectura', photo: 'Caja de regalo Agatha con cinta' },
  { id: 'aros-oscurecen', tag: 'Cuidado de joyas', title: 'Qué hacer para que tus aros no se oscurezcan', time: '4 min de lectura', photo: 'Argollas doradas sobre tela de seda' },
  { id: 'perlas',         tag: 'Tendencias',       title: 'Perlas: el clásico que vuelve',                time: '3 min de lectura', photo: 'Aros de perla sobre piedra natural' },
  // Se muestran al presionar “Cargar más artículos”
  { id: 'largo-collar',   tag: 'Tendencias',       title: 'Cómo elegir el largo ideal de tu collar',      time: '4 min de lectura', photo: 'Collares de distintos largos sobre maniquí' },
  { id: 'guardar',        tag: 'Videos',           title: 'Tutorial: cómo guardar tus joyas',             time: 'Video · 3 min',    video: true, photo: 'Manos ordenando joyas en un estuche' },
  { id: 'regalo-pareja',  tag: 'Regalos',          title: 'Ideas para regalar a una amiga',               time: '5 min de lectura', photo: 'Joyas envueltas en papel de seda' },
];

const CATEGORIES = [
  { id: 'collares', name: 'Collares', cat: 'Collares', photo: 'Collar dorado con dije sobre caja nude' },
  { id: 'anillos',  name: 'Anillos',  cat: 'Anillos',  photo: 'Anillos dorados apilados sobre lino' },
  { id: 'aros',     name: 'Aros',     cat: 'Aros',     photo: 'Argollas doradas sobre piedra' },
  { id: 'pulseras', name: 'Pulseras', cat: 'Pulseras', photo: 'Pulsera dorada sobre tela clara' },
];

// Líneas supuestas, a confirmar con la marca
const ACCESSORIES = [
  { id: 'casio',       name: 'Relojes Casio Vintage', photo: 'Reloj Casio Vintage dorado en muñeca' },
  { id: 'carteras',    name: 'Carteras',              photo: 'Cartera pequeña en tono nude' },
  { id: 'lentes',      name: 'Lentes',                photo: 'Lentes de sol sobre fondo claro' },
  { id: 'pelo',        name: 'Accesorios de pelo',    photo: 'Pinzas y coleros en tonos tierra' },
  { id: 'panuelos',    name: 'Pañuelos',              photo: 'Pañuelo de seda doblado' },
  { id: 'cinturones',  name: 'Cinturones',            photo: 'Cinturón con hebilla dorada' },
];

const COLLECTIONS = [
  { id: 'esencia',    name: 'Esencia',    photo: 'Collar dorado con dije, fondo cálido' },
  { id: 'naturaleza', name: 'Naturaleza', photo: 'Aros en forma de hoja dorada' },
  { id: 'minimal',    name: 'Minimal',    photo: 'Anillos finos dorados' },
  { id: 'ocasiones',  name: 'Ocasiones',  photo: 'Aros de perla, fondo elegante' },
];

const VALUES = [
  { name: 'Elegancia',    icon: 'gem',   text: 'Piezas delicadas que elevan cualquier look, del día a día a una ocasión especial.' },
  { name: 'Autenticidad', icon: 'spark', text: 'Joyas que acompañan tu estilo personal y no se parecen a las de las grandes cadenas.' },
  { name: 'Cercanía',     icon: 'chat',  text: 'Te asesoramos por WhatsApp y redes, como lo haría una amiga.' },
];

const STEPS = [
  { n: '01', name: 'Seleccionamos', text: 'Elegimos cada pieza por su diseño y calidad.' },
  { n: '02', name: 'Revisamos',     text: 'Revisamos cada joya antes de publicarla.' },
  { n: '03', name: 'Empacamos',     text: 'Cada pedido va en caja Agatha, lista para regalar.' },
  { n: '04', name: 'Enviamos',      text: 'Despachamos a todo Chile con seguimiento.' },
];

const CHANNELS = [
  { title: 'Dirección',           value: 'Concepción, Chile',        note: 'Venta online a todo Chile', icon: 'pin' },
  { title: 'Teléfono / WhatsApp', value: '+56 9 1234 5678',          note: 'Respuesta en horario hábil', icon: 'phone' },
  { title: 'Email',               value: 'hola@agathaaccesorios.cl', note: 'Respondemos en 24 h',        icon: 'mail' },
  { title: 'Instagram',           value: '@agathaaccesorios',        note: 'Escríbenos por DM',          icon: 'ig' },
];

// Respuestas provisorias, a validar con la marca
const FAQS = [
  { q: '¿Cuánto demora mi pedido?',            a: 'Despachamos a todo Chile con seguimiento. Al confirmar tu compra te enviamos el plazo estimado según tu comuna.' },
  { q: '¿Cómo hago un cambio o devolución?',   a: 'Tienes hasta 30 días para cambiar tu producto sin costo. Escríbenos por WhatsApp o correo con tu número de pedido.' },
  { q: '¿Las joyas se oscurecen?',             a: 'Con el cuidado adecuado mantienen su color. Evita el contacto con perfume, agua de mar y humedad, y guárdalas por separado.' },
  { q: '¿Puedo pedir envoltorio de regalo?',   a: 'Sí. Todas nuestras joyas pueden ir en caja Agatha, lista para regalar.' },
];

const BENEFITS = [
  { icon: 'truck',  title: 'Envíos a todo Chile',    sub: 'Con seguimiento de tu pedido' },
  { icon: 'lock',   title: 'Pago seguro',            sub: 'Webpay y Mercado Pago' },
  { icon: 'repeat', title: 'Cambios sin costo',      sub: 'Hasta 30 días' },
  { icon: 'chat',   title: 'Asesoría por WhatsApp',  sub: 'Te ayudamos a elegir' },
];

// Íconos estilo Lucide (trazo 1.5px)
const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  user:   '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  heart:  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  bag:    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  truck:  '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  lock:   '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  chat:   '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  arrow:  '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  gem:    '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  spark:  '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  pin:    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  phone:  '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail:   '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  ig:     '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  filter: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  menu:   '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:  '<path d="M18 6 6 18M6 6l12 12"/>',
  chev:   '<path d="m6 9 6 6 6-6"/>',
};
