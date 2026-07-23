# ADR-0046 — Flutter adaptive, density, accessibility and platform policy

## Contexto

Flutter debe cubrir touch, pointer, teclado, terminales y ventanas redimensionables sin crear otra identidad.

## Decisión

Los únicos umbrales son traducciones de thresholds certificados: 520, 640, 768, 1024 y 1180 logical pixels. `NexoAdaptiveInfo` clasifica ventana/orientación/altura; `NexoDensity` selecciona desktop, touch o compact sin cambiar tokens de marca. Material 3 aporta semántica y comportamiento; custom theme aporta apariencia. iOS no recibe una identidad Cupertino independiente. Una API única deriva reduced motion/transparency/high contrast desde MediaQuery. Targets mínimos son 44dp.

## Alternativas

Breakpoints por dispositivo y paddings por pantalla se descartaron. Consultas de accesibilidad dispersas también. Cupertino visual separado rompería paridad.

## Consecuencias, riesgos y reversión

POS futuro decide composición con constraints, no device names. 1024 exacto usa shell persistente como Web. Haptics, scanner y back quedan en adapters de plataforma futuros. Los perfiles pueden ampliarse solo con evidencia de hardware.
