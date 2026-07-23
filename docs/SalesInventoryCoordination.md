# Sales–Inventory Coordination

Process manager híbrido: reserva sincrónica por API pública de Inventory y publicación eventual por outbox. Sales solo envía ProductVariant.id. `prepare` reserva; `confirm` consume; cancel/failure/expiry libera. Cada comando tiene key derivada de Sale+operación+línea. Compensaciones fallidas se marcan para retry/alerta; jamás se presentan como éxito.

Variantes sin tracking se venden por policy. Stock negativo requiere policy y autorización explícitas.
