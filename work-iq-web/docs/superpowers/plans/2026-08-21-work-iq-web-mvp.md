# WORK IQ Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-new-paid-cost, mobile-first WORK IQ web MVP that validates daily quiz demand, anonymous daily poll engagement, return behavior, sharing, and contextual HONNE/BEFoAF interest.

**Architecture:** Next.js 16.3 App Router with static editorial question data, localStorage for anonymous learner progress, Next.js route handlers plus Supabase Free for aggregate poll voting and anonymous funnel analytics. Runtime LLM calls, auth, payments, and native apps are excluded.

**Tech Stack:** Node.js 24 LTS, Next.js 16.3.x, React 19.2.x, TypeScript, Tailwind CSS 4.3.x, Zod, Vitest, React Testing Library, Playwright, Supabase Free.

**Spec:** `docs/superpowers/specs/2026-08-21-work-iq-web-mvp-design.md`

## Global Constraints

- No new paid SaaS or runtime AI API.
- No login in MVP.
- No payment code in MVP.
- No fake ranking or percentile.
- Poll aggregate stays hidden until vote.
- User progress remains anonymous and local-first.
- Current affairs require fresh, dated sources.
- Service-role secrets must never reach the browser.
- Production CTA URLs must come from environment variables.
- All user-facing primary UX is Japanese.
- Implement mobile-first.
- TDD for domain logic and critical flows.
- Do not expand scope beyond the design specification.

---

## Task 1: Scaffold and quality gates

**Files:**
- Create: `package.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Produces a runnable Next.js application and test commands used by all later tasks.

- [ ] Step 1: Inspect the target repository before editing. If it is an empty/new repository, scaffold a Next.js App Router TypeScript project with `src/`, Tailwind, ESLint, and npm. If an existing project already contains a compatible stack, preserve its conventions instead of replacing it.
- [ ] Step 2: Set Node engine to Node 24 compatible range and confirm framework packages are on secure supported releases.
- [ ] Step 3: Add Vitest, React Testing Library, jsdom, Playwright, and Zod.
- [ ] Step 4: Add scripts: `dev`, `build`, `start`, `lint`, `test`, `test:watch`, `test:e2e`, `validate:content`.
- [ ] Step 5: Add `.env.example` containing only names, never real secrets:
  - `SUPABASE_URL=`
  - `SUPABASE_SERVICE_ROLE_KEY=`
  - `ANON_HASH_SALT=`
  - `NEXT_PUBLIC_SITE_URL=`
  - `NEXT_PUBLIC_HONNE_URL=`
  - `NEXT_PUBLIC_BEFOAF_URL=`
- [ ] Step 6: Run lint, unit-test bootstrap, and production build.
- [ ] Step 7: Commit as `chore: scaffold work iq web mvp`.

Acceptance:
- Development server starts.
- No secret is committed.
- Lint and build pass.

---

## Task 2: Domain types and content validation

**Files:**
- Create: `src/lib/domain/types.ts`
- Create: `src/lib/domain/schemas.ts`
- Create: `scripts/validate-content.ts`
- Test: `src/lib/domain/schemas.test.ts`

**Interfaces:**
- Produces `Question`, `DailyPoll`, `QuizSession`, and validated content-loading contracts.

- [ ] Step 1: Write failing tests for:
  - exactly four choices
  - `single_correct` requiring `correctChoiceId`
  - `best_answer` requiring `recommendedChoiceId`
  - current-affairs requiring `source`
  - poll having no correct answer field
  - HTTPS current-affairs source
- [ ] Step 2: Run tests and verify failure.
- [ ] Step 3: Implement Zod schemas and exported inferred TypeScript types.
- [ ] Step 4: Implement `scripts/validate-content.ts` to recursively validate all content JSON.
- [ ] Step 5: Run tests and content validator.
- [ ] Step 6: Commit as `feat: define work iq content schema`.

Acceptance:
- Invalid content fails CI/local validation with a useful path and message.

---

## Task 3: Seed editorial content

**Files:**
- Create: `src/content/business-terms.json`
- Create: `src/content/judgment.json`
- Create: `src/content/risk.json`
- Create: `src/content/current-affairs/README.md`
- Create: `src/content/polls/README.md`
- Create: `docs/content_guide.md`

**Interfaces:**
- Produces validated content consumed by quiz selection.

- [ ] Step 1: Add 25 business-term questions covering STEP 1–5.
- [ ] Step 2: Add 25 judgment questions covering STEP 1–5.
- [ ] Step 3: Add 25 risk-management questions covering STEP 1–5.
- [ ] Step 4: Every business-term question must teach meaning, usage, timing, or audience; do not make all 25 simple definition questions.
- [ ] Step 5: Every `best_answer` explanation must explicitly explain trade-offs.
- [ ] Step 6: Add a content guide showing the exact JSON shapes for a dated current-affairs file and daily poll file.
- [ ] Step 7: Do not invent current news if the implementation environment cannot verify live sources. The application must support a valid “更新準備中” state instead.
- [ ] Step 8: Run `npm run validate:content`.
- [ ] Step 9: Commit as `content: add beginner work iq question bank`.

Acceptance:
- 75 evergreen questions validate.
- No filler text, placeholder content, or deliberately absurd distractors.

---

## Task 4: Local progress repository

**Files:**
- Create: `src/lib/storage/local-progress.ts`
- Create: `src/lib/time/jst.ts`
- Test: `src/lib/storage/local-progress.test.ts`
- Test: `src/lib/time/jst.test.ts`

**Interfaces:**
- Produces:
  - `getOrCreateAnonId(): string`
  - `loadProgress(): ProgressState`
  - `saveProgress(state: ProgressState): void`
  - `getJstDateKey(date?: Date): string`

- [ ] Step 1: Write failing tests for first-run state, schema version, persistence round trip, malformed localStorage recovery, and JST date rollover.
- [ ] Step 2: Implement a versioned progress object.
- [ ] Step 3: Generate anonymous UUID locally and never collect email/name.
- [ ] Step 4: Bound stored histories so localStorage cannot grow indefinitely.
- [ ] Step 5: Pass tests.
- [ ] Step 6: Commit as `feat: add anonymous local progress`.

Acceptance:
- Corrupted storage fails safe to a fresh state without crashing.

---

## Task 5: Scoring, STEP unlock, streak, and review scheduler

**Files:**
- Create: `src/lib/scoring/work-iq.ts`
- Create: `src/lib/review/scheduler.ts`
- Create: `src/lib/quiz/session.ts`
- Test: `src/lib/scoring/work-iq.test.ts`
- Test: `src/lib/review/scheduler.test.ts`
- Test: `src/lib/quiz/session.test.ts`

**Interfaces:**
- Produces deterministic scoring and review functions.

- [ ] Step 1: Write failing tests for weight values 1.00, 1.10, and 1.25.
- [ ] Step 2: Write failing tests for score state: `測定中`, `仮測定`, and full `WORK IQ`.
- [ ] Step 3: Write failing test that poll answers never affect WORK IQ.
- [ ] Step 4: Write failing test that 4/5 unlocks next STEP and 3/5 does not.
- [ ] Step 5: Write failing tests for review sequence 1 → 3 → 7 → 30 days and reset after wrong review.
- [ ] Step 6: Write failing streak tests based on JST dates.
- [ ] Step 7: Implement minimal pure functions.
- [ ] Step 8: Pass all tests.
- [ ] Step 9: Commit as `feat: add scoring and spaced review logic`.

Acceptance:
- Same answers always produce the same score.
- No percentile is calculated.

---

## Task 6: Quiz selection engine

**Files:**
- Create: `src/lib/quiz/select-questions.ts`
- Test: `src/lib/quiz/select-questions.test.ts`

**Interfaces:**
- Produces:
  - `selectDailyQuestions(input): Question[]`
  - `getStepQuestions(category, step): Question[]`

- [ ] Step 1: Test daily preferred composition: 2 business terms, 1 judgment, 1 risk, 1 fresh current affairs.
- [ ] Step 2: Test fallback when no fresh current-affairs question exists.
- [ ] Step 3: Test recent-question avoidance when adequate pool exists.
- [ ] Step 4: Test exact STEP question selection.
- [ ] Step 5: Implement selector with injectable date/random seed for deterministic tests.
- [ ] Step 6: Pass tests.
- [ ] Step 7: Commit as `feat: add quiz selection engine`.

Acceptance:
- Daily quiz always returns five valid scored questions when evergreen pool is valid.

---

## Task 7: Design system and navigation shell

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/ProgressBar.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces reusable accessible primitives.

- [ ] Step 1: Implement system Japanese font stack, neutral background, dark text, blue accent, focus styles, 44 px touch targets, max 720 px desktop content width.
- [ ] Step 2: Implement 3-tab mobile bottom nav: 今日 / 学ぶ / 成長.
- [ ] Step 3: Respect reduced motion.
- [ ] Step 4: Add semantic landmarks and accessible navigation labels.
- [ ] Step 5: Verify at 390 × 844 and desktop.
- [ ] Step 6: Commit as `feat: add work iq mobile design shell`.

Acceptance:
- No horizontal overflow at 390 px.
- Keyboard focus is visible.

---

## Task 8: Home and learn screens

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/learn/page.tsx`
- Create: `src/app/learn/[category]/page.tsx`
- Create: `src/components/home/ScoreCard.tsx`
- Create: `src/components/home/ReviewCard.tsx`
- Create: `src/components/home/DailyPollCard.tsx`
- Create: `src/components/home/DailyQuizCard.tsx`

**Interfaces:**
- Consumes local progress and STEP unlock state.

- [ ] Step 1: First-time home shows brand, disclaimer-safe score state, daily quiz primary CTA, poll card, and category entry.
- [ ] Step 2: Returning home shows streak and yesterday review only when applicable.
- [ ] Step 3: Learn page shows business terms, judgment, risk, current affairs.
- [ ] Step 4: Three evergreen category pages show STEP 1–5 and locked state.
- [ ] Step 5: Current-affairs page does not show artificial STEP locking.
- [ ] Step 6: Commit as `feat: add home and learning navigation`.

Acceptance:
- User can reach every MVP learning mode within two taps from Home.

---

## Task 9: Quiz interaction

**Files:**
- Create: `src/components/quiz/QuizRunner.tsx`
- Create: `src/components/quiz/ChoiceButton.tsx`
- Create: `src/components/quiz/AnswerFeedback.tsx`
- Create: `src/app/quiz/daily/page.tsx`
- Create: `src/app/quiz/[category]/step/[step]/page.tsx`
- Create: `src/app/quiz/current-affairs/page.tsx`
- Test: `src/components/quiz/QuizRunner.test.tsx`

**Interfaces:**
- Produces a completed local `QuizSession`.

- [ ] Step 1: Write component tests that answer cannot be changed after locking.
- [ ] Step 2: Test feedback text is not conveyed by color alone.
- [ ] Step 3: Test no auto-advance after answering.
- [ ] Step 4: Implement progress `n / 5`, choice, feedback, next action.
- [ ] Step 5: Save answer immediately to local progress so refresh does not silently lose completed answers.
- [ ] Step 6: Complete Q5 and route to `/result/[sessionId]`.
- [ ] Step 7: Commit as `feat: add five question quiz flow`.

Acceptance:
- Full 5-question flow works on touch and keyboard.

---

## Task 10: Result and progress screens

**Files:**
- Create: `src/app/result/[sessionId]/page.tsx`
- Create: `src/app/progress/page.tsx`
- Create: `src/components/result/SessionScore.tsx`
- Create: `src/components/progress/CategoryScores.tsx`
- Create: `src/components/progress/ScoreDisclaimer.tsx`

**Interfaces:**
- Consumes scoring and local progress.

- [ ] Step 1: Display session score, correct count, WORK IQ state, category impact, and learned points.
- [ ] Step 2: Display the IQ disclaimer.
- [ ] Step 3: Update STEP unlock only after completion.
- [ ] Step 4: Progress page shows WORK IQ, category scores, streak, recent sessions.
- [ ] Step 5: Never render national rank or percentile.
- [ ] Step 6: Commit as `feat: add work iq results and progress`.

Acceptance:
- First few answers show `測定中` / `仮測定`, not false precision.

---

## Task 11: Yesterday review

**Files:**
- Create: `src/app/quiz/review/page.tsx`
- Create: `src/lib/review/build-review-session.ts`
- Test: `src/lib/review/build-review-session.test.ts`

**Interfaces:**
- Produces review sessions from due queue.

- [ ] Step 1: Test due-item selection using JST date.
- [ ] Step 2: Test no review card when none are due.
- [ ] Step 3: Implement review quiz reusing QuizRunner.
- [ ] Step 4: Correct answer advances schedule; wrong answer resets.
- [ ] Step 5: Track review completion locally.
- [ ] Step 6: Commit as `feat: add yesterday review flow`.

Acceptance:
- Missed questions can reappear without duplicating broken queue entries.

---

## Task 12: Supabase schema for polls and analytics

**Files:**
- Create: `supabase/migrations/001_mvp.sql`
- Create: `src/lib/supabase/server.ts`
- Create: `docs/analytics_queries.sql`

**Interfaces:**
- Produces server-only poll vote and event persistence.

- [ ] Step 1: Create `poll_votes` with:
  - UUID primary key
  - `poll_id text not null`
  - `option_id text not null` constrained to `a,b,c,d`
  - `voter_hash text not null`
  - timestamp
  - unique `(poll_id, voter_hash)`
- [ ] Step 2: Create `analytics_events` with allowed structured fields and JSON metadata.
- [ ] Step 3: Revoke direct anonymous table access; application writes through server route using service-role key.
- [ ] Step 4: Add indexes for poll/date and event/time queries.
- [ ] Step 5: Add SQL queries for funnel, completion, share, poll, D1/D7 proxy, CTA CTR.
- [ ] Step 6: Commit as `feat: add anonymous mvp data schema`.

Acceptance:
- Migration contains no user email/name/profile columns.

---

## Task 13: Daily poll API and UI

**Files:**
- Create: `src/app/api/poll/current/route.ts`
- Create: `src/app/api/poll/vote/route.ts`
- Create: `src/lib/poll/repository.ts`
- Create: `src/app/poll/page.tsx`
- Create: `src/components/poll/PollQuestion.tsx`
- Create: `src/components/poll/PollResults.tsx`
- Test: `src/lib/poll/repository.test.ts`
- Test: `src/app/api/poll/vote/route.test.ts`

**Interfaces:**
- Client sends `pollId`, `optionId`, `anonId`.
- Server returns aggregate only after accepted/already-existing vote state.

- [ ] Step 1: Test malformed choice rejection.
- [ ] Step 2: Test duplicate browser identity cannot create a second row.
- [ ] Step 3: Test aggregate is not requested/displayed before vote.
- [ ] Step 4: Implement server SHA-256 hash using `ANON_HASH_SALT`.
- [ ] Step 5: Implement current poll loader by JST date.
- [ ] Step 6: Implement vote UI, percentages, counts, and thinking points.
- [ ] Step 7: If backend env is missing, show a clear non-crashing “集計準備中” state in development; production acceptance requires configured backend.
- [ ] Step 8: Commit as `feat: add everyone would you do poll`.

Acceptance:
- No fake percentages.
- No raw anonymous token stored in DB.

---

## Task 14: Anonymous analytics

**Files:**
- Create: `src/app/api/events/route.ts`
- Create: `src/lib/analytics/track.ts`
- Test: `src/app/api/events/route.test.ts`

**Interfaces:**
- `track(eventName, properties)` sends only allowlisted fields.

- [ ] Step 1: Define exact allowlist of event names from the spec.
- [ ] Step 2: Reject unknown event names and oversized metadata.
- [ ] Step 3: Hash anon identity server-side.
- [ ] Step 4: Add events to landing, quiz start, complete, result, share, poll, review, category, CTA.
- [ ] Step 5: Never send prompt text, free-text, email, IP fields, or employer data.
- [ ] Step 6: Commit as `feat: add anonymous product analytics`.

Acceptance:
- Funnel can be calculated from DB without collecting direct identity.

---

## Task 15: Contextual HONNE and BEFoAF CTA

**Files:**
- Create: `src/lib/cta/select-cta.ts`
- Create: `src/components/cta/ServiceCta.tsx`
- Test: `src/lib/cta/select-cta.test.ts`

**Interfaces:**
- `selectCta(context): "honne" | "befoaf" | null`

- [ ] Step 1: Test judgment/risk result can select HONNE.
- [ ] Step 2: Test poll tags `communication`, `relationship`, `social` can select BEFoAF.
- [ ] Step 3: Test missing environment URL returns no card.
- [ ] Step 4: Enforce maximum one CTA per result/poll view.
- [ ] Step 5: Track impression and click.
- [ ] Step 6: Commit as `feat: add contextual ahpe service ctas`.

Acceptance:
- No popup, interruption, or diagnostic wording about user problems.

---

## Task 16: Social sharing

**Files:**
- Create: `src/lib/share/share-result.ts`
- Create: `src/components/result/ShareButton.tsx`
- Test: `src/lib/share/share-result.test.ts`

**Interfaces:**
- Uses Web Share API when available, clipboard fallback otherwise.

- [ ] Step 1: Test share text contains score but no fake percentile.
- [ ] Step 2: Test clipboard fallback.
- [ ] Step 3: Shared URL must resolve for another device to a challenge landing experience, not a broken localStorage-only result.
- [ ] Step 4: Track share click and successful share/copy where detectable.
- [ ] Step 5: Commit as `feat: add social result sharing`.

Acceptance:
- Share works on supported mobile browser and has a usable fallback.

---

## Task 17: Current-affairs freshness workflow

**Files:**
- Modify: `scripts/validate-content.ts`
- Create: `src/lib/quiz/current-affairs.ts`
- Test: `src/lib/quiz/current-affairs.test.ts`

**Interfaces:**
- Produces `getFreshCurrentAffairs(nowJst): Question[]`.

- [ ] Step 1: Test questions without source are rejected.
- [ ] Step 2: Test stale batches are not labeled “today”.
- [ ] Step 3: Test `checkedAt` and dates parse correctly.
- [ ] Step 4: Add editorial command documentation: create dated JSON using existing AI tools, verify source/date, run validator, commit, deploy.
- [ ] Step 5: Add graceful empty state.
- [ ] Step 6: Commit as `feat: enforce current affairs freshness`.

Acceptance:
- Old news cannot silently appear as current.

---

## Task 18: About, privacy, metadata, and SEO

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Provides transparent public product information.

- [ ] Step 1: About page explains purpose and IQ disclaimer.
- [ ] Step 2: Privacy page explains localStorage, anonymous vote storage, anonymous analytics, no login, and no claim of scientific representativeness.
- [ ] Step 3: Add Japanese title/description/OpenGraph metadata.
- [ ] Step 4: Add canonical site URL from `NEXT_PUBLIC_SITE_URL`.
- [ ] Step 5: Commit as `feat: add public trust pages and metadata`.

Acceptance:
- No privacy statement claims data is absent when anonymous events are actually stored.

---

## Task 19: End-to-end tests and launch QA

**Files:**
- Create: `e2e/daily-quiz.spec.ts`
- Create: `e2e/step-unlock.spec.ts`
- Create: `e2e/poll.spec.ts`
- Create: `e2e/review.spec.ts`
- Create: `e2e/share.spec.ts`

**Interfaces:**
- Verifies the critical product journey.

- [ ] Step 1: Daily flow: Home → daily quiz → five answers → result.
- [ ] Step 2: STEP flow: 4/5 unlocks next STEP.
- [ ] Step 3: Poll flow: no aggregate before vote → aggregate after vote.
- [ ] Step 4: Review flow using seeded localStorage state.
- [ ] Step 5: Share fallback using mocked Web Share support.
- [ ] Step 6: Run `npm run lint`.
- [ ] Step 7: Run `npm test`.
- [ ] Step 8: Run `npm run test:e2e`.
- [ ] Step 9: Run `npm run validate:content`.
- [ ] Step 10: Run `npm run build`.
- [ ] Step 11: Verify no secret is in git diff or browser bundle.
- [ ] Step 12: Check 390×844 layout and keyboard flow.
- [ ] Step 13: Commit as `test: verify work iq mvp critical flows`.

Acceptance:
- All commands pass before deployment.

---

## Task 20: Deployment without paid add-ons

**Files:**
- Modify only deployment configuration required by the existing environment.
- Create: `docs/deployment.md`

**Interfaces:**
- Produces public HTTPS URL for SNS validation.

- [ ] Step 1: Use the existing Vercel account/project if its plan permits the intended use; do not enable a paid add-on.
- [ ] Step 2: Configure server-only secrets in deployment environment, never in repository.
- [ ] Step 3: Configure public site and CTA URLs.
- [ ] Step 4: Apply Supabase Free migration.
- [ ] Step 5: Verify production poll and event insertion.
- [ ] Step 6: Verify result share link from a second device/browser.
- [ ] Step 7: Confirm privacy page is reachable.
- [ ] Step 8: Document rollback.
- [ ] Step 9: Commit as `docs: add work iq mvp deployment guide`.

Final release gate:
- Definition of Done in the design specification is fully satisfied.
- No new paid subscription has been activated.
- No runtime OpenAI/Anthropic API is called.
- Public URL is ready for SNS test traffic.
