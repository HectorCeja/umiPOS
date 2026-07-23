# NEXO Product Experience Principles

Status: permanent product rule.

NEXO optimizes the complete owner experience together with architecture, performance,
security and testability. A technically correct result is incomplete when the owner must
guess what is happening, what to do next or whether an action succeeded.

## Decision lens

Before closing work, verify:

1. The owner understands the current state and the next valid action.
2. The primary action is visually unambiguous and risky actions cannot be mistaken for it.
3. Copy uses business language before internal terminology.
4. Feedback follows authoritative server confirmation.
5. Layout, type, color, iconography and motion use the shared system.
6. Keyboard, touch, screen reader, high contrast and reduced motion remain first-class.
7. The shortest safe path is the default path.
8. The result feels deliberate enough to represent NEXO publicly today.

## Visual character

NEXO is calm, precise, technological and premium without spectacle. Space creates order;
typography creates hierarchy; color communicates brand or state; motion explains continuity.
No effect may compete with operational content.

## Governance

- Web consumes `@nexo/ui`; Flutter consumes `nexo_flutter_design`.
- `NexoBrand` is the only code-owned brand rendering.
- Component consumers use semantic tokens, never local palette values.
- New typography sizes require a role in the official scale.
- A visual exception belongs in the authoritative component and requires regression evidence.
- Product rules and data integrity always take precedence over polish.
