# Previous fix failure analysis — Part 2C

- 2B verificó que el builder existía después del upload, pero no certificó su altura visible. El DOM
  podía seguir montado mientras el owner veía un panel vacío.
- El toast tenía `position: fixed`, pero no estaba portaleado: `fixed` no garantiza viewport cuando un
  ancestro crea containing block.
- El seed parecía ordenado en un bloque antiguo, pero un segundo reset Alpha2 conservaba el orden
  `product` antes de `variant`; además la limpieza global era incompatible con datos del owner.
- El chevron anterior puso `no-repeat` sin `!important`; shorthands de superficies posteriores lo
  revirtieron.
- Los iconos correctos sustituyeron los legacy, pero el wrapper siguió usando baseline de botón.
