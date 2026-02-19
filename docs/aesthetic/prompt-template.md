# Aesthetic Implementation Prompt Template

Use this template whenever you want a component/page transformed without drifting generic.

## 1) Intent Paragraph (required)
"Build an operational command center surface with forest/cream visual identity, light-weight numeric hierarchy, vertical campaign lanes, and geometric icon language. Avoid generic SaaS dashboard styling."

## 2) Target and Scope (required)
- Target files:
- In-scope behavior to preserve:
- Out-of-scope files:

## 3) Reference Mapping (required)
For each reference image, include:
- `copy`: concrete behaviors to emulate
- `avoid`: concrete behaviors to reject

Example:
- Ref A
  - copy: sparse card rhythm, thin progress bars, uppercase mono labels
  - avoid: colorful badge clusters

## 4) Non-Negotiables (required)
- Forest/cream identity only.
- Large light numerals for top metrics.
- Vertical campaign cards with drill-down tasks.
- Geometric symbols for hierarchy.
- Sparkline trend cues in stat cards.

## 5) Hard Constraints (required)
- For private CC, use only `--hive-*` tokens.
- No violet/blue/amber/zinc utility drift.
- No status-dot-first signaling.
- Preserve existing route/props/function behavior.

## 6) Output Contract (required)
- Modify only listed files.
- Include a brief self-audit:
  - forbidden-pattern grep result,
  - build/typecheck result,
  - known drift risk.

## 7) Drift Guardrails (required)
- If design ambiguity appears, prefer structure changes over accent-color additions.
- If semantic differentiation is needed, use text + border + tone, not rainbow color coding.

## 8) Feedback Hook (required)
At each checkpoint, return:
1. what changed
2. what improved
3. drift observed
4. one concrete rating request (5D rubric)

## Ready-to-Run Prompt Block
```text
You are implementing a visual redesign with strict brand constraints.

Intent:
[PASTE intent paragraph]

Targets:
[PASTE files]

References:
[PASTE reference mapping]

Non-negotiables:
[PASTE non-negotiables]

Hard constraints:
[PASTE hard constraints]

Acceptance:
- Build passes.
- Forbidden-pattern grep has zero actionable hits.
- Layout reads as operations board at a glance.

Output contract:
- Edit only target files.
- Provide self-audit and residual drift risk.
```
