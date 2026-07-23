# ADR-0052: Flutter scene transition policy

**Status:** Accepted

Scene transitions retain at most the current and previous artwork, use a 1600 ms controlled crossfade, and identify generations so rapid changes cancel stale completion. Reduced Motion completes without decorative delay.
