# Session Routing

Root routing distinguishes authenticated, expired and absent sessions. A valid identity never redirects because of a transient secondary read-model failure. A 401 is the only response that establishes an expired/absent session; other failures retain a recoverable product state.

After expiry, login explains what happened and may restore a safe destination. Logout clears server cookies and local presentation state, then returns to root. Back navigation cannot restore an authorized surface without a valid cookie.
