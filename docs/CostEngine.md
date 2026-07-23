# Cost Engine

Cost es una proyección separada: no cambia disponibilidad ni Product. FIFO consume capas más antiguas; Weighted Average calcula valor restante más entrada dividido entre cantidad restante más entrada; Standard usa el costo configurado y registra variaciones futuras. LIFO existe en el enum para compatibilidad, pero el dominio lo rechaza.

Cada recepción con costo genera una capa con moneda ISO 4217, cantidad original/restante y movimiento fuente. Nunca se usa coma flotante en la base de datos; persistencia usa Decimal(20,6). Odoo documenta FIFO, AVCO y Standard como estrategias distintas y capas de valoración como evidencia.
