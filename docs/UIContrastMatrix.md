# UI Contrast Matrix — stabilization baseline

Date: 2026-07-15. Scope: Prompt 12.8. This is a functional contrast audit of the
existing dark-first tokens; it does not introduce a new palette or visual direction.
Ratios were calculated from sRGB relative luminance and evaluated against WCAG 2.2 AA.

| Foreground               | Background            |   Ratio | Use                | Result |
| ------------------------ | --------------------- | ------: | ------------------ | ------ |
| `#F7F8FC` primary text   | `#070912` canvas      | 18.72:1 | headings/body      | PASS   |
| `#B3BBD0` secondary text | `#070912` canvas      | 10.35:1 | supporting text    | PASS   |
| `#7F89A3` muted text     | `#070912` canvas      |  5.69:1 | captions           | PASS   |
| `#F7F8FC` primary text   | `#101627` surface     | 16.97:1 | cards/forms        | PASS   |
| `#B3BBD0` secondary text | `#101627` surface     |  9.38:1 | descriptions       | PASS   |
| `#7F89A3` muted text     | `#101627` surface     |  5.15:1 | captions           | PASS   |
| `#F7F8FC` primary text   | `#161D32` elevated    | 15.76:1 | menus/dialogs      | PASS   |
| `#B3BBD0` secondary text | `#161D32` elevated    |  8.71:1 | menu descriptions  | PASS   |
| `#7F89A3` muted text     | `#161D32` elevated    |  4.78:1 | captions only      | PASS   |
| `#F7F8FC` primary text   | `#1D2640` interactive | 14.10:1 | controls           | PASS   |
| `#B3BBD0` secondary text | `#1D2640` interactive |  7.79:1 | control help       | PASS   |
| `#927FFF` primary hover  | `#101627` surface     |  5.75:1 | interactive accent | PASS   |
| `#4D9FFF` informational  | `#101627` surface     |  6.62:1 | links/info         | PASS   |
| `#55D99A` success        | `#101627` surface     | 10.10:1 | success feedback   | PASS   |
| `#F4C76B` warning        | `#101627` surface     | 11.34:1 | warning feedback   | PASS   |
| `#FF667A` error          | `#101627` surface     |  6.37:1 | errors/destructive | PASS   |

## Guardrails found by the audit

- Muted `#7F89A3` on interactive `#1D2640` is 4.28:1 and is prohibited for normal
  text. Interactive controls use secondary or primary foreground instead.
- Base violet `#8068FF` on elevated/interactive surfaces is below 4.5:1. It may be a
  non-text decoration; text and icons use `#927FFF` or the primary foreground.
- Selected/hover controls explicitly preserve their foreground color. Hover must never
  resolve to transparent text or a foreground equal to its background.
- Schedule labels use primary/secondary text tokens; Team cards and form children may
  shrink and wrap instead of clipping their content.

The future pixel-perfect implementation must rerun this matrix for any changed token.
