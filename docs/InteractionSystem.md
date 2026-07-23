# Interaction System

## V1 implementation

Prompt 12.7 applies the Design Bible timing families (80/140/220/320/480 ms), route continuity, ambient backgrounds and visible focus. Violet is brand/action, blue is focus/information and mint is success only. The custom-product onboarding flow uses immediate pressed/selected feedback and preserves server-backed onboarding progress. See `MotionSystem.md`.

NEXO uses one interaction contract across the web.

`MutationButton`, `SaveStatus`, `FormErrorSummary`, `InlineError` and `InlineSuccess` expose server-backed progress without duplicating business rules. A write prevents double submission, preserves entered values after failure and distinguishes conflict from ordinary failure. Success is announced only after the authoritative response.

`Dialog` closes with Escape or an outside click and returns focus to its trigger. Command Palette uses the same dialog foundation. Selection components expose native roles and pressed/selected state so keyboard and assistive technology receive the same information as pointer users.

Motion uses tokenized short transitions. Reduced-motion removes smooth scrolling and nonessential transitions. Hover is never the only indication of availability.
