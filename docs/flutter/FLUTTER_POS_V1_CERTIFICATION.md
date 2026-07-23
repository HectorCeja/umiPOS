# Flutter POS V1 Certification

Certification date: 2026-07-17. Status: **CERTIFIED**.

The frozen V1 scope is certified for design parity, productive behavior, security, financial integrity and accessibility. OpenAPI 8.9.0 exposes 139 operations. Certification used Flutter 3.44.6 / Dart 3.12.2, real PostgreSQL, Redis, MinIO, API and worker services, the productive Flutter client, and connected browser tests.

The final financial probe contains exactly three completed sales, three captured payment attempts, three canonical receipts, two cash movements for the two cash tenders, and one completion event per sale. Runtime and worker roles have no `BYPASSRLS`; all V1 tenant-owned relations have RLS and FORCE RLS. Cross-tenant read and update probes returned zero rows.

The Flutter design package passed 53 tests and 25 deterministic goldens. The POS passed 36 tests, seven POS goldens and its real API E2E. Connected behavior passed 25/25. Root format, lint, typecheck, tests and builds pass on the certified snapshot.

Native execution is **CONDITIONALLY VERIFIED BY CI CONFIGURATION**: all five platform scaffolds and CI workflows exist; this runner does not provide CMake, Ninja, Clang or Android SDK. Analyze and tests expose no native code defect. Web is a test/evidence harness, never the productive POS.

Financial offline operation remains **DISABLED BY DESIGN**. Post-V1 work remains governed by [the backlog](FLUTTER_POS_POST_V1_BACKLOG.md).
