# Sale Items

Una línea contiene snapshot comercial/fiscal inmutable, cantidad decimal (6), dinero en unidades menores, versión y metadata controlada. Al agregar, Sales resuelve la variante por `ProductSalesPort`, verifica sellable/moneda, registra fuente y versión de precio. En checkout revalida vigencia; una divergencia produce `CHECKOUT_RECALCULATION_REQUIRED`.

Fuentes habilitadas inicialmente: BASE_PRICE y, con permiso/política, MANUAL_OVERRIDE. PRICE_LIST, PROMOTION, CUSTOMER_PRICE y UMI_CONTRACT_PRICE quedan declaradas y deshabilitadas.
