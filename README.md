# Agatha Accesorios — boceto funcional (proyecto educativo)

Implementación del diseño de Claude Design en **HTML + CSS + JavaScript vanilla**, sin build, sin dependencias y sin backend.

## Cómo abrirlo
Doble clic en `index.html`. (Necesita internet solo para cargar las fuentes de Google Fonts.)

## Estructura
```
index.html        Esqueleto: anuncio, header, <main id="app">, newsletter, footer
css/styles.css    Tokens de marca (variables CSS) y estilos de todos los componentes
js/data.js        Datos de ejemplo: productos, blog, FAQ, íconos (equivale a una "API")
js/app.js         Router por hash, render de las 5 páginas, filtros, favoritos
js/cart.js        Carrito, panel lateral, checkout y confirmación (maqueta visual)
js/product.js     Ficha de producto: una plantilla reutilizada por todos los productos
js/motion.js      Animaciones: scroll reveal, "volar al carrito", zoom de foto
css/cart.css      Estilos del carrito y el checkout
css/product.css   Estilos de las tarjetas clicables y de la ficha
css/motion.css    Keyframes y transiciones (respetan "reducir movimiento")
img/              (opcional) fotos reales
```

## Ficha de producto
Cada tarjeta (foto o nombre) lleva a `#/producto/<id>`. Es una sola plantilla (`js/product.js`) que lee `PRODUCTS`, `PRODUCT_INFO` y `CAT_INFO` de `js/data.js`: para agregar un producto nuevo basta con sumarlo ahí y su ficha existe sola. Incluye selector de largo/talla según categoría, cantidad, favorito, "Comprar ahora", acordeones de detalles y productos relacionados. Los productos agotados muestran un aviso de stock en vez de "Agregar". Los textos de las fichas son de ejemplo.

## Animaciones
Aparición al hacer scroll (en el hero se anima el texto, pero la foto queda estática), cabecera que se compacta, zoom en fotos al pasar el cursor, "Ver detalle" en tarjetas, producto que vuela a la bolsa al agregarlo, panel del carrito que se desliza, rebote del contador y del corazón, y zoom con lupa en la ficha. Si el sistema tiene activado "reducir movimiento", todo se muestra sin animar. (El manual de marca pedía sobriedad; las animaciones se pidieron después y son suaves a propósito.)

## Flujo de compra (visual)
Agregar al carrito (abre el panel lateral) → `#/carrito` → `#/checkout` → `#/confirmacion`.
- El carrito parte con 2 productos de ejemplo la primera vez; cantidades, quitar y totales funcionan.
- Envío gratis sobre $30.000 (barra de progreso); retiro en Concepción siempre gratis.
- El checkout no valida ni cobra: cualquier clic en "Realizar pedido" lleva a la confirmación, que muestra un número de pedido de ejemplo y vacía el carrito.
- Cupón, Webpay, Mercado Pago y datos de transferencia son solo de muestra.

## Qué es funcional
- Navegación entre Inicio, Nosotros, Productos, Blog y Contacto (`#/inicio`, `#/productos`...). "Colecciones" hace scroll suave a esa sección de Inicio.
- Productos: chips + checkboxes (categoría, colección, material, precio), orden, paginación, búsqueda desde el header.
- Favoritos y contador de carrito (se guardan en `localStorage`).
- Blog: filtro por tema y "Cargar más artículos".
- Contacto: formulario con validación, acordeón de FAQ. Newsletter con confirmación.
- Responsive con menú hamburguesa.

## Qué NO hace (por ser un boceto)
Cobrar de verdad, pagos Webpay/Mercado Pago, validar el checkout, cuentas de usuario, contenido de los artículos y envío real de formularios.

## Fotos reales
Las imágenes son marcadores de posición con la descripción de la foto a producir. Para reemplazarlas, guarda un `.jpg` en `img/` con el id correspondiente y se muestra automáticamente: `img/collar-estrella.jpg`, `img/hero.jpg`, `img/cat-aros.jpg`, `img/col-esencia.jpg`, `img/blog-limpiar.jpg`, etc. (los ids están en `js/data.js`). Los 404 de imágenes en la consola del navegador son esperables mientras no existan.

## Pendientes de confirmar con la marca (según el handoff)
Líneas de accesorios, respuestas de la FAQ, número de WhatsApp (`+56 9 1234 5678` es de ejemplo), y los productos/precios.
