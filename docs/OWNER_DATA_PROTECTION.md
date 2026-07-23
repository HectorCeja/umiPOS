# Owner data protection

Se creó en Organization Alpha un producto y variante centinela deterministas antes de Prepare 2 y 3.
Después de ambos, existen exactamente el producto y su variante. El seed ya no ejecuta `deleteMany`
sobre la lista de organizaciones establecidas. La limpieza se limita al UUID fijo de Alpha2 y se
ejecuta en una transacción con hijos antes que padres.
