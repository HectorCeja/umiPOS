# Typography

## Login y onboarding cinematográficos — 2026-07-15

La inspección del CSS público de TattooFlow (`/_next/static/css/d9ac70c6e08ba398.css`) mostró `ui-sans-serif, system-ui`; no declara una familia nominal verificable. Conforme al criterio del mockup aprobado, Login y Onboarding usan `Inter` como primera opción de la pila, con Manrope y Segoe UI como fallbacks. NEXO no incorpora ni redistribuye archivos de fuente. Display usa 800, botones 600, labels 500 y cuerpo 400; la pila evita bloqueo y layout shift.

## Design Bible V1 — Prompt 12.7

La identidad implementada combina **Instrument Sans Variable** para display y headings con **Manrope Variable** para body, labels y números. Ambas familias usan SIL OFL 1.1, se fijan mediante paquetes `@fontsource-variable` 5.2.8 y se sirven desde el build sin solicitudes de fuente en runtime. Instrument aporta carácter editorial; Manrope conserva legibilidad compacta y cifras tabulares. Los fallbacks no son la identidad principal.

Escala: display 64/68, H1 44/50, H2 30/38, H3 22/30, body 16/25, compact 14/21, label 13/18 y caption 12/17. El tema oscuro es la referencia de aprobación.

## Design freeze 12.6

NEXO uses **Manrope Variable** for the product interface. Its open apertures, compact
numeric forms and restrained geometry keep operational data readable while giving the
hospitality product a more deliberate voice than a generic system stack. It includes
Spanish punctuation and tabular numerals. The package is pinned through
`@fontsource-variable/manrope@5.2.8`; Manrope is licensed under SIL OFL 1.1. The build
self-hosts the optimized WOFF2 subsets, so there is no runtime font request and the
fallback metrics minimize layout shift. NEXO does not redistribute third-party source
files outside that dependency.

- Display: 32–48 px, restrained weight and tight tracking.
- Heading: 20–32 px with clear level progression.
- Body: 14–16 px, comfortable line height.
- Label/caption: 12–14 px, never below accessible reading size.
- Numeric: tabular numerals for money and operational metrics.
- Monospace: diagnostic references only.

The future Flutter client can evaluate the same OFL family while preserving this scale;
that decision is not part of this freeze.
