# Root causes — Part 2B

- Upload: el formulario no se desmontaba; la preview aumentaba su altura dentro de dos contenedores anulados por `overflow:hidden`, haciendo parecer vacío el panel.
- Caja: `run/command` actualizaba `notice/error`, pero la única presentación seguía arriba en `#cash-feedback`.
- 500 Caja: PostgreSQL `23505` dentro de `$queryRaw` llegaba como error Prisma P2010 y no como 409.
- Select: un background más específico eliminaba el chevron base.
- Iconos: onboarding y Productos mantenían mappings locales; las cards interpolaban el nombre interno.
- Móvil: `body{min-width:20rem}`, alturas `100dvh` y overrides tardíos bloqueaban 280 px y el scroll del documento.
- Icon buttons: `display:block` posterior anulaba el centrado flex canónico.
