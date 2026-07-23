# Cash Register

A Register is Branch-scoped logical configuration, not a user or shift. It has stable code, status (`ACTIVE`, `INACTIVE`, `MAINTENANCE`, `ARCHIVED`), default currency/opening float, version and optional Drawer/device references. Archiving preserves history. Only an active Register may open a session; a partial unique index prevents concurrent active sessions.
