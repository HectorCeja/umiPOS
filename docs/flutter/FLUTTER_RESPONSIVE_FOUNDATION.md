# Flutter responsive foundation

## Thresholds certificados

| Logical width | Clase/API                  | Origen                   |
| ------------- | -------------------------- | ------------------------ |
| ≤520          | phone/final compact        | V1 520px                 |
| ≤640          | small tablet               | V1 40rem                 |
| ≤768          | large tablet/mobile crop   | V1 48rem                 |
| ≤1024         | compact desktop            | V1 64rem                 |
| >1024         | desktop                    | persistent shell/pointer |
| 1180          | operational grid threshold | V1 grid                  |

`compactHeight` se activa a 600 logical px, viewport bajo certificado. Orientation permite terminal portrait/landscape sin inventar ancho adicional.

Density: desktop 44, touch 52, compact visual 36 con hit target mínimo 44. Pointer desktop puede compactar en poca altura. `LayoutBuilder`/constraints serán autoridad; no se identifica dispositivo por modelo.

POS futuro decidirá panel count, cart placement y product grid en su pattern, usando estas clases. SafeArea se aplica en shell/panes futuros.
