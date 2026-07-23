# ADR-0033: Sales Platform como autoridad comercial independiente

- Estado: Aceptada
- Fecha: 2026-07-13

## Contexto

Web POS, Flutter, UMI y procesos internos necesitan ejecutar la misma lógica. Square separa Orders de Payments y mantiene importes/versiones en el servidor; OWASP exige autorización por operación y validación del orden de estados.

## Decisión

`@nexo/sales` contiene aggregate, políticas, aritmética, eventos y puertos; no importa Prisma, NestJS, Product, Inventory, UI ni UMI. Los adaptadores viven fuera. Sales es autoridad de precios finales, impuestos, descuentos, estados y recibos. Clientes solo envían intención.

## Alternativas

- Lógica en POS: descartada por duplicación, manipulación y divergencia Flutter/UMI.
- Sales dentro de Product/Inventory: descartada porque mezcla descripción, ledger y transacción comercial.
- Servicio distribuido inmediato: pospuesto; eleva costo operacional sin volumen probado.

## Consecuencias

Monolito modular con boundary extraíble, APIs públicas obligatorias y pruebas de dependencias.

## Fuentes

- [Square Orders API](https://developer.squareup.com/docs/orders-api/what-it-does)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
