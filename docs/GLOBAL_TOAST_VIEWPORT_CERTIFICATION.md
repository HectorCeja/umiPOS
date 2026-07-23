# Global toast viewport certification

`PremiumToastPortal` usa `createPortal(..., document.body)`. La región es fixed, safe-area aware,
aria-live, descartable, con pausa hover/focus y reduced-motion. Se ejecutó una creación real de punto
de cobro con el scroll al final en 1280, 390 y 320 px. Bounding box dentro del viewport y scrollTop
idéntico antes/después: PASS 3/3.
