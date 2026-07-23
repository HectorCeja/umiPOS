# Flutter Motion System

Ambient motion uses one deterministic clock. High and balanced modes can enable aurora movement, Ken Burns, soft drift, trails and precise-pointer parallax. Transform-only parallax is bounded to ±4 px horizontal and ±2.5 px vertical. Artwork scale is bounded to 1.02. Scene crossfade is 1600 ms and stale transitions are cancelled.

Component motion continues to use the Part 1 `NexoMotion` extension. No real-time sleeps are used by tests.
