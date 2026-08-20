# Codex Handoff — WORK IQ Web MVP

Use the following two files as authoritative:

1. `docs/superpowers/specs/2026-08-21-work-iq-web-mvp-design.md`
2. `docs/superpowers/plans/2026-08-21-work-iq-web-mvp.md`

## Instruction to Codex

Implement WORK IQ Web MVP exactly from the design specification and implementation plan.

Before editing:
1. Inspect the repository, current stack, package manager, existing conventions, and git status.
2. Do not overwrite unrelated existing work.
3. If this is a new repository, scaffold the standalone app described in the spec.
4. If an existing compatible application exists, adapt paths to its conventions while preserving every product requirement.

Execution rules:
- Work task-by-task.
- Use tests before implementation for domain logic and critical flows.
- Make small commits after each independently testable task.
- Do not add features outside MVP scope.
- Do not add a paid service.
- Do not add runtime OpenAI, Claude, or other LLM API calls.
- Do not implement login, payment, native app, ranking, or PRO.
- Never fabricate poll percentages, rankings, user counts, or current-news sources.
- If fresh current-affairs sources cannot be verified, implement the designed “更新準備中” state rather than inventing content.
- Never commit secrets.
- Keep user-facing UI in natural Japanese.
- Prioritize 390×844 mobile UX.
- Preserve accessibility requirements.
- Do not claim completion until lint, unit tests, e2e tests, content validation, and production build all pass.

When a step requires credentials or a user-only external action:
- Complete every code/config file that can be prepared first.
- Then report the exact required user action and exact environment-variable name.
- Do not replace missing credentials with fake values in production code.

At the end, report:
1. What was implemented.
2. Test/build command results.
3. Any user-only setup still required.
4. Public deployment status.
5. Known MVP limitations.
6. Next recommended action: SNS validation, not scope expansion.
