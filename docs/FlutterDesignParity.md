# Flutter Design Parity

Export tokens as semantic names and platform-neutral JSON in a future build step; CSS remains web output, not Flutter API. Equivalent components preserve behavior/state but use native navigation, menus, back behavior, focus and window chrome where superior.

Mapping: Button→Filled/OutlinedButton; TextField→TextField; Dialog→AlertDialog; Sidebar/MobileNavigation→NavigationRail/NavigationBar; BottomSheet→showModalBottomSheet; DataTable may become ListView; POS panes use LayoutBuilder constraints. Names, error codes, UX writing keys, money display and connectivity states stay shared.

Support touch, mouse, physical keyboard, scanners, window resizing, Android back, iOS gestures, desktop menus, deep links and restoration. Offline remains future-ready: client-generated IDs/idempotency keys, visible queue and conflict resolution; payments/completion requiring connection are policy-driven. Flutter must not imitate HTML when a native accessible pattern is better.
