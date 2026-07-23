# Owner workflow

## Preparar un negocio totalmente limpio

`pnpm owner:business:new`

El comando crea una identidad local, una organización, su membresía Owner, una sucursal y progreso
de onboarding nuevo. Imprime el correo; usa la credencial local documentada. No modifica ni elimina
organizaciones existentes.

## Compartir y validar

1. `pnpm owner:share`
2. Abrir la URL Web impresa desde el dispositivo elegido.
3. Entrar con el usuario limpio.
4. Completar onboarding.
5. Recorrer Inicio, Productos, Inventario, Caja, Ventas, Equipo, Configuración, Perfil, Reportes y Ayuda.
6. Guardar Console/Network y una captura ante cualquier fallo.

Diagnóstico: `pnpm manual-acceptance:status` y `pnpm manual-acceptance:logs`.
