# Responsive System

Desktop mantiene sidebar de 216 px, topbar anclada y grid operativo. Debajo de 1180 px los KPI y paneles se redistribuyen. Debajo de 850 px la sidebar se convierte en drawer con scrim, Escape y control explícito. Debajo de 520 px Home usa una columna y búsqueda compacta.

Login pasa de escena dividida a hero reducido y formulario prioritario. Se usan `100dvh`, scroll natural y targets de 44 px. Los gates verifican 390×844, 768×1024, 1440×900 y ausencia de overflow horizontal; la inspección incluye 320 CSS px y zoom/reflow.
