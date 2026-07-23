# NEXO Design Language — UI Parte 1

Fuente visual: `login.png` (1672×941) y `home.png` (1600×900), inspeccionados el 15 de julio de 2026. La implementación conserva canvas oscuro, jerarquía editorial, superficies profundas y acentos violeta/azul/cian sin convertir toda la interfaz en neón.

Principios: contenido antes que efecto; una jerarquía luminosa por pantalla; profundidad por capas; bordes localizados; movimiento funcional; datos reales; estados honestos; español de México; foco siempre visible; responsive por contenido. Se prohíben superficies default, gradientes genéricos, UUID, lenguaje técnico, cifras inventadas y brillo uniforme.

La fuente web usa las familias OFL ya empaquetadas: Instrument Sans Variable para display y Manrope Variable para UI. No se añadieron dependencias ni assets remotos.

Las primitivas viven en `packages/ui`; Login y Home consumen el mismo motor ambiental. Las pantallas futuras deben reutilizar tokens, `LivingScene`, botones, inputs y superficies antes de agregar variantes.
