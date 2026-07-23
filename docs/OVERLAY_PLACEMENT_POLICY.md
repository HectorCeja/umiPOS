# Política de colocación de overlays

- Onboarding: toast superior seguro; ayuda inferior derecha.
- Si la ayuda está abierta, el toast ocupa la zona superior izquierda/editorial y la ayuda limita su
  altura disponible.
- Resto de desktop: toast inferior derecho.
- Móvil: márgenes y safe areas; el toast de onboarding permanece arriba.
- Los overlays se renderizan mediante portal a `document.body`; nunca alteran layout ni scroll.
- La colisión se resuelve por zonas y geometría, no elevando arbitrariamente el `z-index`.
