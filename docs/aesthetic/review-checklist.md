# Aesthetic Review Checklist (Pass/Fail)

## Visual Identity
- [ ] Uses forest/cream identity throughout private CC surfaces.
- [ ] No accent-color drift into blue/purple/amber/zinc.
- [ ] Cards use restrained tone contrast, not rainbow semantics.

## Typography
- [ ] Primary metrics use light-weight large numerals.
- [ ] Labels use uppercase mono tracking where appropriate.
- [ ] Hierarchy between title/metric/meta is immediately clear.

## Layout and Structure
- [ ] Dashboard reads as operations board at first glance.
- [ ] Campaigns are vertical lanes, not horizontal card grid.
- [ ] Agent hierarchy reads as command chain schematic.
- [ ] Activity section reads as timeline/ledger, not generic feed.

## Interaction and Semantics
- [ ] Campaign drill-down is clear and low-friction.
- [ ] Status is represented with text chips (not dot-first).
- [ ] Progress indicators are thin bars (not circles).

## Token and Constraint Compliance
- [ ] Private Hive components use `--hive-*` tokens.
- [ ] No hardcoded non-brand palette values for semantic styling.
- [ ] No forbidden utility classes in scoped files.

## Quality Gates
- [ ] `npm run build` passes.
- [ ] Forbidden-pattern audit reports no actionable findings.
- [ ] Empty/low-data states still look intentional.
- [ ] Mobile layout preserves hierarchy and readability.

## Audit Commands
```bash
rg -n "zinc|violet|purple|blue-|amber-|bg-gray|text-gray" src/components/private/hive src/pages/private/CommandCenterV2.tsx
npm run build
```
