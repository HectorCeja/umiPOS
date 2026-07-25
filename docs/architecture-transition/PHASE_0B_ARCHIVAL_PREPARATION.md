# Phase 0B — Archival Preparation

## Proposed tag

`nexo-transition-baseline-2026-07`

## Target commit

The proposed tag target is the frozen transition baseline:

`b6ef871de195484314b78c015ecfde9a5c8697f4`

This is `origin/transition/nexo-rc-baseline`.

The Phase 0A documentation commit is not the archival source baseline.

It records analysis of that baseline.

## Preconditions

Before creating the tag:

1. Confirm the target hash from `origin/transition/nexo-rc-baseline`.
2. Confirm the local worktree is clean.
3. Confirm the Phase 0A and Phase 0B evidence checksums.
4. Resolve repository-authored code ownership review.
5. Confirm artwork and icon decisions.
6. Obtain explicit owner approval for an annotated archival tag.
7. Confirm the remote URL and permissions.

## Tag annotation template

```text
NEXO transition baseline for UmiPOS selective extraction.

Commit: b6ef871de195484314b78c015ecfde9a5c8697f4
Authority: reference only; never a production backend, database, identity, worker, or dashboard.
Data migration: none.
Evidence: Phase 0A and Phase 0B transition documentation.
```

## Future procedure

```sh
git fetch origin --tags
git show --no-patch b6ef871de195484314b78c015ecfde9a5c8697f4
git status --short --branch
git tag -a nexo-transition-baseline-2026-07 b6ef871de195484314b78c015ecfde9a5c8697f4 -m "NEXO transition baseline for UmiPOS selective extraction"
git show nexo-transition-baseline-2026-07
git push origin nexo-transition-baseline-2026-07
```

Do not run these commands in Phase 0B-1.

## Verification

After a future tag creation:

```sh
git rev-parse nexo-transition-baseline-2026-07^{}
git ls-remote --tags origin nexo-transition-baseline-2026-07
git fsck --full
```

The annotated tag must resolve to the target commit.

## Incorrect tag recovery

Stop publication if the target is wrong.

If the tag remains local, delete it locally and recreate it after review.

If the tag was pushed, do not force-update it.

Create a new corrected archival tag after owner approval and record the obsolete tag.

## Retirement dependencies

The tag does not authorize deletion.

NEXO remains reference-only until UMI reaches the replacement gates for contracts, client, checkout, cash, inventory, receipt, offline, KDS, and operations.
