# ADR-0049: Flutter LivingScene ownership

**Status:** Accepted

Flutter LivingScene uses one engine widget, one clock, typed configuration, isolated repaint layers and widget-owned lifecycle disposal. Controllers per effect/particle and business state in the design package are rejected.
