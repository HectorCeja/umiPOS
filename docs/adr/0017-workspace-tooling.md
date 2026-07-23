# ADR-017 — pnpm workspaces and Turborepo

**Status:** Accepted — 2026-07-11

Use pnpm workspaces for strict, efficient dependency installation and one exact lockfile. Use Turborepo only for dependency-aware task scheduling, cache and consistent root commands. Alternatives were npm workspaces (broader default but weaker strictness/disk efficiency), Nx (valuable generators/graph enforcement but unnecessary platform surface now) and independent repositories (break atomic contracts). Package scripts remain runnable without Turbo to reduce lock-in.
