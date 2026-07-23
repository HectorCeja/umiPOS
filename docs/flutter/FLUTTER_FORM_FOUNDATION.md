# Form foundation

`NexoTextField` cubre texto, email, password, number, currency-ready, search y multiline. Expone formatter, keyboard type, autofill, focus node, helper/error, prefix/suffix y acciones. `NexoFormSection` aporta descripción, error summary, loading, actions y una o dos columnas adaptativas. `NexoFieldGroup` agrupa controles relacionados preservando reading order.

Los errores se renderizan mediante `InputDecoration`; passwords permiten mostrar/ocultar con botón accesible. Formatting de moneda, fechas o cantidades pertenece a feature/domain y se inyecta.
