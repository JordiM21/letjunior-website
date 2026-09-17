# Antes de publicar

Lo que falta para que el sitio pueda salir. Todo lo demás está hecho y
verificado. Cada punto dice dónde vive en el código, para que sea una edición
y no una búsqueda.

## Bloqueantes legales — la UE los exige, no son opcionales

- [ ] **Razón social, CIF y domicilio** en el footer.
      `index.html`, al final, junto al `©`. Marcado con TODO.
- [ ] **Aviso legal, Privacidad y Cookies.** Las tres páginas no existen; los
      enlaces del footer apuntan a `#`. No se quitan como se quitaron los
      iconos sociales rotos, porque con actividad comercial en la UE son
      obligatorias: hay que escribirlas.
- [ ] **Mención de protección de datos de menores.** El sitio pide a un padre
      que dé el nombre y la edad de su hijo por WhatsApp. Una línea corta sobre
      cómo se tratan esos datos baja fricción y es requisito de RGPD.

## Datos que solo tú tienes

- [ ] **Certificaciones de Jordi, Sofia y Ersa.** Las tres tarjetas dicen
      "Certificación pendiente". Nunca se inventó ninguna: una cara real no
      puede llevar un título falso.
- [ ] **Dominio.** Todo el SEO usa `https://www.letjunior.com/`. Está en
      `index.html` (canonical, `og:url`, JSON-LD), `robots.txt` y `sitemap.xml`.
      Si el dominio final es otro, son cinco reemplazos.
- [ ] **Instagram y TikTok**, si existen. YouTube y Facebook ya están puestos.

## Confirmaciones antes de cobrar

- [ ] **Precios.** $15 / 2 semanas y $50 / mes salieron de la auditoría de
      conversión, no de ti directamente. Están publicados en la sección de
      planes y en el FAQ. Confírmalos.
- [ ] **Que el bot de WhatsApp diga lo mismo que el sitio.** Ahora la web dice
      Plan Inicial $15, 4 clases de 1 hora, martes y jueves, hasta 8 niños, con
      garantía. Si el bot todavía habla de clase gratis, el padre ve una
      contradicción tres mensajes después de hacer clic.
- [ ] **Y que los anuncios de Meta digan lo mismo.** Mismo motivo.

## Requisitos del hosting — el rendimiento depende de esto

- [ ] **Compresión activada (brotli o gzip).** Sin ella, `styles.css` viaja
      48 KB en vez de 13 KB y `index.html` 44 KB en vez de 10 KB. Es la
      diferencia más grande que queda en la primera carga y no se toca desde
      el código. Netlify, Vercel, Cloudflare Pages y GitHub Pages la traen de
      serie; un Apache o Nginx propio hay que configurarlo.
- [ ] **Cache-Control largo para `assets/`.** Las dos fuentes
      (`assets/fonts/*.woff2`, 49 KB juntas) y las imágenes optimizadas no
      cambian nunca: `Cache-Control: public, max-age=31536000, immutable`.
      Con eso, la segunda visita de un padre no descarga ninguna de las dos.
      `index.html`, `styles.css` y `main.js` sí deben revalidar.

## Recomendado, no bloqueante

- [ ] **Analítica.** `main.js` ya dispara eventos por cada CTA por separado
      (`cta_hero`, `cta_header`, `cta_sticky`, `cta_final`, `testimonial_play`)
      pero no hay GA4 ni Meta Pixel cargados que los reciban. Con tráfico de
      pago, saber qué botón convierte vale más que cualquier cambio de color.
- [ ] **Máster vectorial del logo.** El actual se recuperó recortando el fondo
      de un PNG de 1080px. Limpio a los tamaños que usamos, pero es un rescate.
- [ ] **Foto de Jean Paul más grande.** Su recorte se queda en 92px y es la
      única cara borrosa de la rejilla del hero.

## Ya resuelto

WhatsApp conectado en los 8 CTAs · precios y horarios reales en el FAQ ·
sección de planes con garantía · contadores inventados eliminados · profesores
reales con foto · testimonios en vídeo y reseñas reales · robots.txt, sitemap,
canonical, og:image y JSON-LD · alt text · enlaces muertos fuera · tema mango
con los azules del logo como secundario · fuentes autoalojadas (fuera Google
Fonts: dos orígenes y un viaje de ida y vuelta menos antes de la primera
letra) · iconos del método, del silencio, del check y de las redes dibujados
en SVG, ya no emoji.
