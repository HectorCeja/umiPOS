# Flutter Scene Lifecycle

The engine observes Flutter lifecycle. Only `resumed` is active; inactive, paused, hidden and detached stop the clock. Resume continues the accumulated clock rather than creating a second ticker. Controllers are created once in `initState`, disposed with the widget and never constructed from `build`.
