# Auditoría de copy y CTAs — landing de LET Academy

Revisé `index.html` y `main.js` línea por línea. No toqué código, esto es solo el análisis y las propuestas. El problema de fondo no es de redacción: la página está vendiendo un negocio distinto al que existe hoy.

## Veredicto en una frase

La landing está construida sobre el modelo de "clase gratis" que ya probaste y descartaste (tu propia nota dice que solo atraía cazadores de freebies), y no menciona en ningún sitio el embudo que sí tienes funcionando ahora: Meta Ads → WhatsApp → Plan Inicial de $15/2 semanas con garantía → upsell a Plan Completo $50/mes. Antes de tocar una sola frase, hay que decidir qué embudo vende esta página, porque hoy vende el equivocado.

## Tu mayor propuesta de valor

No es "inglés que sí les divierte" (eso es tono de marca, no un motivo de compra) y no es la clase gratis. Es esto, y hoy no aparece en ningún lugar de la página:

**Grupos de máximo 4 niños, con la misma profesora siempre — no una app, no un video, una clase real donde se sabe el nombre de tu hijo.**

Esto ataca directamente los dos dolores que describe tu propio brief de proyecto: el niño ignorado en una clase masiva, y el miedo a hablar. Es específico, es verificable, y ninguna academia tradicional con 30 alumnos por aula puede decir lo mismo. Constrúyela alrededor de esto, no alrededor de "gratis".

## La frase con más apalancamiento

Está enterrada en el tercer testimonio falso: *"Lucas llevaba dos años de academia sin soltar una palabra. En LET habló en la primera clase."* Esa estructura —años de frustración en el modelo tradicional resueltos en una sola clase— es el gancho emocional más fuerte de todo el sitio, y hoy vive a mitad de página, dentro de una tarjeta de testimonio que además es inventada.

Si el dato "el 90% de los alumnos habla en su primera clase" (línea 175, marcado como TODO, sin verificar) es cierto o defendible con tus 7 alumnos actuales, esa es tu frase de hero. Súbela al primer scroll, no la dejes en la sección de método. Si no puedes defenderla con tus números reales, no la publiques — con 6-7 alumnos un dato así se cae en la primera pregunta de un padre escéptico.

## El CTA que debería mandar

Hoy hay cuatro CTAs ("Clase gratis" en el header, hero, barra sticky y CTA final) y los cuatro apuntan a `#reservar`, una sección de la misma página sin ningún flujo de reserva real detrás — ni siquiera un enlace a WhatsApp con `href="#"` (líneas 41, 338, 382).

Dado que todo tu negocio corre por WhatsApp Web y Kommo, el CTA principal debería ser un enlace directo `https://wa.me/<tu número>?text=<mensaje precompuesto>` que aterrice al lead directo en tu bot de Kommo — no un ancla a una sección vacía. Y el texto del botón debería vender el Plan Inicial ($15, 2 semanas, con garantía), no una clase gratis que ya sabes que no convierte:

> **"Empieza por $15 — 2 semanas, con garantía"** en vez de **"Agenda una clase gratis"**

Esto también resuelve la inconsistencia entre el sitio (habla de "clase gratis") y lo que el padre encuentra tres mensajes después en tu bot de WhatsApp (que habla del Plan Inicial de $15). Esa discrepancia es fricción y desconfianza gratis.

## Riesgos de credibilidad que hay que resolver antes de lanzar (no son de copy, son de honestidad)

Estos no se arreglan suavizando la frase — hay que decidir qué contar:

1. **"+250 familias felices" (línea 61) y "+12 profesores" (línea 115).** Tienes 6-7 alumnos y eres la única profesora. Si un padre convertido en clase de prueba pregunta "¿cuál de sus 12 profesores le va a tocar a mi hijo?" y la respuesta es "yo, siempre yo", el sitio ya mintió antes de la primera clase. Esto no es optimización, es un pasivo legal y reputacional. Opción real: convierte el hecho de ser fundadora-profesora en propuesta de valor ("tu hija tiene la misma profesora todo el curso, no un roster rotativo") en vez de fingir una plantilla de 12.

2. **Cuatro profesores ficticios (Sarah, Daniel, Emily, Tom, líneas 258-281) con nombres, credenciales y datos curiosos inventados.** Es la sección más peligrosa de toda la página tal como está: describe personas que no existen con TEFL/CELTA falsos. Sustitúyela por tu perfil real (foto, tu certificación real si la tienes, por qué enseñas tú personalmente) o elimina la sección — una sola profesora real vende más confianza que cuatro inventadas.

3. **Datos de horario y grupo que no coinciden con tu oferta real.** El hero dice "Grupos de máx. 4" (línea 104, con TODO de "confirmar"), pero el Plan Inicial es hasta 8 alumnos. El FAQ dice "50 minutos, dos veces por semana" (línea 306) cuando el Plan Completo real es 1 hora, 3 veces/semana (lun/mié/vie) y el Plan Inicial es 1 hora, 2 veces/semana (mar/jue). El CTA final dice "45 minutos" (línea 336) para la clase gratis. Ninguno de estos tres números coincide entre sí ni con lo que dice tu bot. Antes de escribir copy nuevo, fija una sola verdad para precio, duración, frecuencia y tamaño de grupo, y repítela igual en el sitio, el bot y los anuncios.

4. **Testimonios con ciudades españolas (Valencia, Sevilla, Bilbao, Zaragoza, líneas 127-142) para una audiencia de Colombia, Panamá y Bolivia.** Un padre en Bogotá que ve "Marta G. — Valencia" percibe al instante que la página no es para él. Mínimo: cambia las ciudades a Bogotá, Medellín, Ciudad de Panamá, Santa Cruz. Ideal: sustitúyelos por testimonios reales de tus 6-7 familias en cuanto tengas su consentimiento — con tan pocos alumnos, cada testimonio real vale más que cuatro inventados.

## Recomendaciones adicionales, por sección

**Header (líneas 26-45).** "Iniciar sesión" no tiene destino ni propósito visible — no mencionas un portal de alumnos en ningún lado. Quítalo o dile qué hace; un enlace muerto en el header es fricción sin motivo.

**Hero (líneas 50-107).** El H1 "Inglés que sí les divierte" es tono de marca, no motivo de compra — está bien como titular emocional, pero la línea de apoyo (`lede`, línea 66) debería cargar el dolor real ("grupos reducidos" ya lo dice; añade "con la misma profesora" ya que es tu diferenciador más fuerte y hoy no aparece hasta la sección 3). El botón "Ver cómo funciona" es correcto como CTA secundario de baja fricción — mantenlo, pero que el primario apunte a WhatsApp, no a un ancla.

**Prueba social (líneas 109-147).** Antes de "+250 familias" arreglado, decide si mostrar el número real (6-7 con marco honesto tipo "familias que confiaron desde el primer día") vale más que una cifra inflada. Con una audiencia que va a encontrar el número real en la primera conversación de WhatsApp, la cifra inflada se descubre rápido.

**Método (líneas 150-179).** Los tres bloques (plataforma interactiva, método audiovisual, clases en vivo) son genéricos — cualquier academia dice esto. El dato fuerte real que tienes y no usas aquí es el tamaño de grupo (máx. 4) y la continuidad de profesora — muévelos aquí como el argumento central, no como una lista de features intercambiables.

**Demo interactiva (líneas 182-246, y todo `setupLesson` en main.js).** Esta es la pieza más fuerte de toda la página y está infrautilizada. Ningún competidor deja que el padre (o el niño) prueben una pregunta real antes de comprometerse — es una prueba de producto, no solo una animación. El CTA de salida ya está bien resuelto ("Agenda su clase gratis", línea 239) pero debe cambiar de destino y de oferta igual que los demás CTAs. Considera promocionar esta demo más arriba en la página (hoy vive en la sección 3b) porque es tu mejor herramienta de conversión antes de pedir el contacto de WhatsApp.

**FAQ (líneas 290-327).** Tres respuestas evaden el dato real (duración/frecuencia con TODO, precio con TODO, "Escríbenos por WhatsApp" con `href="#"`). Para tráfico frío de Meta Ads, ocultar el precio en el FAQ solo funciona si el precio se revela rápido en WhatsApp — que es tu caso — así que no es necesariamente un error, pero sí lo es un enlace de WhatsApp roto en la pregunta donde más intención de compra hay.

**CTA final y footer (líneas 330-383).** Mismo problema de destino (`href="#"`, línea 338) y mismo copy de clase gratis. Los iconos sociales (IG/FB/TT/YT, líneas 357-360) también apuntan a `#` — si no vas a enlazar redes reales todavía, considera quitarlos en vez de mostrar un footer que no lleva a ningún sitio real.

## Qué haría primero si solo pudiera arreglar tres cosas

1. Cambiar los cuatro CTAs de "clase gratis" a wa.me con el Plan Inicial de $15 como oferta — es la desalineación más cara porque contradice un aprendizaje que ya te costó tiempo validar.
2. Quitar o reescribir la sección de profesores ficticios y la cifra de "+12 profesores" — es el riesgo de confianza más alto.
3. Unificar precio/horario/tamaño de grupo en un solo número por dato, igual en sitio, bot y anuncios.

Todo lo demás (testimonios, ciudades, orden de secciones) importa, pero no rompe la promesa como estas tres.
