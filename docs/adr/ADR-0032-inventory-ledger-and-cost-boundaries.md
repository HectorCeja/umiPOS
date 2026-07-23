# ADR-0032: Ledger inmutable por variante y motor de costos separado

- Estado: Aceptada
- Fecha: 2026-07-14

## Decisión

Inventory es un bounded context independiente que referencia exclusivamente `ProductVariant.id`. La fuente de verdad es un ledger append-only de cantidades decimales por tenant, variante, ubicación y estado; los balances se derivan y los snapshots son proyecciones reconstruibles. Reservas y transferencias conservan su ciclo de vida, pero todo efecto cuantitativo se registra en el ledger. Costos se proyectan en capas separadas con FIFO, promedio ponderado y costo estándar; LIFO permanece modelado y deshabilitado. Eventos y outbox se escriben atómicamente.

## Alternativas evaluadas

- Un campo `stock` mutable es simple, pero pierde historia, auditabilidad y correcciones reproducibles.
- Event sourcing de toda la plataforma agrega complejidad innecesaria; el ledger se limita al dominio donde la historia es la realidad comercial.
- Acoplar costo o stock a Product viola su límite descriptivo y dificulta servicios y productos sin inventario.
- Un sistema externo de inventario hoy introduce lock-in y consistencia distribuida sin evidencia de necesidad.

## Consecuencias

Las escrituras requieren idempotencia y transacciones; los balances pueden reconstruirse y reconciliarse. PostgreSQL FORCE RLS protege nueve tablas tenant-owned. Snapshots nunca reemplazan el ledger. POS, Compras y Ecommerce consumirán Application Services y eventos, nunca tablas ni Product directamente.
