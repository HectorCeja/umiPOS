# Totals Engine

Dinero cruza contratos como string de unidades menores y persiste BIGINT. Cantidades son decimal string escala 6. Cálculo por línea: cantidad×precio → descuentos secuenciales → base gravable → impuesto → total. HALF_UP es default configurable; HALF_EVEN y DOWN están soportados.

La distribución global futura usará largest remainder con desempate estable por line ID. Invariantes: subtotal ≥ descuento; total ≥ 0; paid ≤ total aplicado; due = total-paid; change solo proviene de tendered CASH; misma entrada produce mismo resultado.
