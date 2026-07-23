# Owner acceptance execution

Run `pnpm manual-acceptance:prepare`, then open `artifacts/manual-acceptance/current-run/START_HERE.md`. The preparer is local/test-only, builds two workers and produces a resettable demo/checklist package. The owner records real observations in `results.md` and evidence in the adjacent directories.

After the owner finishes, run `pnpm manual-acceptance:record`. The recorder validates statuses, counts PASS/FAIL/BLOCKED/NOT_RUN, identifies unpassed critical cases and emits `summary.json` and `defects.json`. It exits non-zero until the actual acceptance is complete; it never changes code or closes the phase.

Current status: **PENDING OWNER EXECUTION**. No owner result has been fabricated or inferred from automated tests.
