# Flutter platform adaptation

| Capacidad | Touch móvil/tablet | Desktop               | Terminal POS futuro               |
| --------- | ------------------ | --------------------- | --------------------------------- |
| input     | touch + IME        | mouse + keyboard      | touch + hardware keyboard/scanner |
| hover     | no requerido       | permitido             | según pointer                     |
| back      | system/navigation  | route/shortcut        | policy del flow                   |
| safe area | system insets      | window bounds         | hardware/window bounds            |
| density   | touch              | desktop/compact       | touch o compact por constraints   |
| parallax  | no                 | permitido por quality | desactivado por default           |

Scroll behavior, focus traversal, shortcuts, haptics y window controls se adaptan mediante adapters futuros. Android/iOS/Windows/macOS/Linux conservan el mismo theme NEXO. Barcode scanner se tratará como input, no lógica visual. No existe todavía soporte ejecutable de plataforma o enrolamiento.

Foundation declares `es-MX` and `en`; product copy belongs in future ARB files. Components consume ambient directionality and never hardcode currency/date/number formatting. RTL remains prepared by layout policy but is not certified in V1.
