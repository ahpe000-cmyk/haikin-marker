# WORK IQ Web MVP Design Specification

Version: 1.0
Date: 2026-08-21
Status: Approved design for Codex handoff
Product: WORK IQ
Primary goal: Validate demand before spending on native apps, paid infrastructure, or runtime AI APIs.

## 1. Product objective

Build a mobile-first Japanese web MVP that lets a working adult open a URL, answer 5 questions in about 3 minutes, receive a WORK IQ learning score, answer a daily “みんなならどうする？” poll, review yesterday’s mistakes, and share a result to social media.

The MVP exists to answer one business question:

「社会人が、毎日また使いたくなるほどこの体験に価値を感じるか？」

It is not the final product.

## 2. Cost constraint

The MVP must not introduce a new paid SaaS, paid database plan, paid AI API, App Store fee, or Google Play fee.

Allowed:
- Existing GPT / Cursor / Claude subscriptions for development work.
- Existing GitHub and existing deployment environment.
- Free-tier infrastructure if required for public validation.
- Supabase Free only for anonymous poll aggregation and anonymous product analytics.
- Existing Vercel account/project if its current plan permits the intended use.

Not allowed in MVP:
- OpenAI API runtime calls
- Anthropic API runtime calls
- Paid vector DB
- Paid analytics
- Stripe
- Native iOS / Android build
- Paid auth provider
- Paid push notification provider

Important: ChatGPT subscription billing and API billing are separate. Therefore this design does not assume the ChatGPT subscription provides runtime API usage.

## 3. Product positioning

Brand name: WORK IQ

Japanese description:
「社会人力を、毎日5問で。」

Main copy:
「あなたの社会人力、何点？」

Important disclaimer:
「WORK IQは本サービス独自の学習・実務判断スコアです。心理検査や知能指数（IQ）を測定するものではありません。」

Tone:
- Adult
- Smart
- Fast
- Practical
- Not like school
- Not childish
- Not certification-test-like

Use words such as:
「挑戦」「STEP」「LEVEL」「成長」「判断」「今日の5問」

Avoid excessive use of:
「勉強」「授業」「試験」

## 4. Target

Primary:
22–39 years old, approximately 1–15 years of work experience.

Use cases:
- Wants to understand common business terms.
- Wants to improve practical judgment.
- Wants to understand current business news.
- Wants to compare judgment with other adults.
- Wants a short daily routine rather than long learning sessions.

No age gate is required.

## 5. MVP scope

### Included

1. Home
2. Today’s 5 questions
3. Business terms / abbreviations
4. “あなたならどうする？”
5. Risk management
6. Current affairs
7. “みんなならどうする？”
8. Yesterday review
9. Beginner STEP progression
10. WORK IQ score
11. Category scores
12. Streak
13. Result sharing
14. Anonymous product analytics
15. Contextual HONNE / BEFoAF promotion
16. Privacy page
17. About page

### Explicitly excluded

- Login
- Apple login
- Google login
- Email login
- Paid plan
- PRO
- Native app
- Push notifications
- National ranking
- Age ranking
- Job ranking
- User comments
- Community posting
- AI chat
- Runtime AI generation
- Intermediate / advanced course
- 6,750-question full curriculum
- Admin CMS
- Personal profile
- Direct messaging

## 6. Information architecture

Routes:

- `/` Home
- `/learn` Category selection
- `/learn/business-terms`
- `/learn/judgment`
- `/learn/risk`
- `/learn/current-affairs`
- `/quiz/daily`
- `/quiz/business-terms/step/[1-5]`
- `/quiz/judgment/step/[1-5]`
- `/quiz/risk/step/[1-5]`
- `/quiz/current-affairs`
- `/result/[sessionId]`
- `/poll`
- `/progress`
- `/about`
- `/privacy`

Mobile bottom navigation:
1. 今日
2. 学ぶ
3. 成長

No account tab in MVP.

## 7. Home screen order

1. WORK IQ logo
2. WORK IQ score card
3. Streak
4. Yesterday review card, only when review items exist
5. “今日のみんなならどうする？”
6. “今日の5問”
7. “ジャンルから選ぶ”
8. Current affairs shortcut
9. Minimal footer with About / Privacy

First-time visitor:
- No forced onboarding.
- No login.
- Primary CTA: 「今日の5問に挑戦」
- Show “仮測定” instead of pretending the score is precise.

## 8. Learning categories

### A. Business terms / abbreviations

Beginner STEP 1–5, 5 questions each, 25 evergreen questions minimum.

Question progression inside a concept:
1. Meaning
2. Difference from a related term
3. Correct usage
4. Correct timing / audience
5. Practical scenario

Examples:
KPI, KGI, ROI, ASAP, PDCA, LTV, CVR, CPA, BtoB, BtoC, agenda, milestone, resource, evidence, consensus.

Every abbreviation explanation must include:
- Full English expansion if applicable
- Plain Japanese meaning
- Practical example
- Appropriate timing
- Inappropriate usage when relevant

### B. “あなたならどうする？”

Beginner STEP 1–5, 25 questions minimum.

Themes:
- Priority
- Reporting
- Deadline
- Mistake
- Customer request
- Team conflict
- Lack of information
- Responsibility
- Ethics
- Escalation

Most questions use `best_answer` rather than pretending all practical judgment has a universal answer.

### C. Risk management

Beginner STEP 1–5, 25 questions minimum.

Themes:
- Mis-sent email
- Lost device
- Password
- Confidential data
- Personal data
- Complaint
- Accident
- Harassment witness
- Suspicious email
- Social media incident
- Initial response
- Evidence preservation
- Escalation
- Recurrence prevention

### D. Current affairs

Special category. Do not freeze news into permanent STEP content.

Display:
- “今日の時事5問”
- Most recent verified batch

Each question must contain:
- Source title
- Source URL
- Published date
- Event date when known
- Last checked timestamp
- Short factual explanation
- “仕事にどう関係する？” note when appropriate

Current-affairs content is created during development/editorial work using the user’s existing AI tools, then committed as data. No runtime LLM API.

If no valid fresh batch exists:
- Do not display old news as “今日”.
- Show a neutral message: 「今日の時事問題は更新準備中です。」
- Never silently fall back to stale news.

## 9. Question modes

Use exactly these modes:

`single_correct`
- Clear factual correct answer.

`best_answer`
- One recommended answer for the scenario, but explanation acknowledges conditions and trade-offs.

`poll_no_correct`
- No correct answer.
- Used only for “みんなならどうする？”.

## 10. Question data model

```ts
type Category =
  | "business_terms"
  | "judgment"
  | "risk"
  | "current_affairs";

type QuestionMode =
  | "single_correct"
  | "best_answer";

type ChoiceId = "a" | "b" | "c" | "d";

interface Choice {
  id: ChoiceId;
  text: string;
}

interface SourceInfo {
  title: string;
  url: string;
  publishedAt: string;
  eventDate?: string;
  checkedAt: string;
}

interface TermInfo {
  label: string;
  expansion?: string;
  plainDefinition: string;
  goodUsage?: string;
  badUsage?: string;
}

interface Question {
  id: string;
  category: Category;
  level: "beginner";
  step?: 1 | 2 | 3 | 4 | 5;
  mode: QuestionMode;
  prompt: string;
  choices: Choice[];
  correctChoiceId?: ChoiceId;
  recommendedChoiceId?: ChoiceId;
  explanation: string;
  choiceExplanations: Record<ChoiceId, string>;
  tags: string[];
  term?: TermInfo;
  source?: SourceInfo;
}
```

Rules:
- Exactly four choices.
- `single_correct` requires `correctChoiceId`.
- `best_answer` requires `recommendedChoiceId`.
- No ambiguous duplicate choices.
- Explanation must explain why the selected answer is strong and why key alternatives are weaker.
- No medical/legal/tax individualized advice in MVP.
- Current affairs require `source`.

## 11. Daily poll data model

```ts
interface DailyPoll {
  id: string;
  date: string; // YYYY-MM-DD JST
  prompt: string;
  choices: Choice[];
  tags: string[];
  thinkingPoints: string[];
  ctaHint?: "honne" | "befoaf" | "none";
}
```

Rules:
- No correct answer.
- User cannot see aggregate before voting.
- After vote, show counts and percentages.
- Show “考えるポイント” rather than “正解”.
- Do not manufacture demographic splits.
- Do not display fake nationwide data.

## 12. Daily 5-question selection

Preferred mix:
- 2 business terms
- 1 judgment
- 1 risk
- 1 current affairs

If a fresh current-affairs question is unavailable:
- Replace it with one question from judgment or risk.
- Label the session simply “今日の5問”; do not imply a news item was included.

Avoid repeats from the previous 7 days when the pool permits.

## 13. STEP progression

For business terms, judgment, risk:

- STEP 1 is unlocked initially.
- One STEP = 5 fixed questions.
- 4/5 or 5/5 unlocks the next STEP.
- 0–3/5 keeps next STEP locked.
- Replay is always allowed.
- STEP 5 is the MVP beginner checkpoint.

Current affairs has no STEP locking in MVP.

## 14. Answer interaction

For each question:
1. Display progress: `2 / 5`
2. User selects one choice.
3. Lock answer.
4. Show:
   - Correct / Recommended / Your choice
   - Explanation
   - Choice-level explanation where useful
5. CTA: 「次の問題」
6. After Q5 → result

Do not auto-advance immediately after a tap.

## 15. WORK IQ scoring

Purpose:
A motivational learning score, not a psychometric IQ.

Question weights:
- Factual knowledge: 1.00
- Usage / timing: 1.10
- Best-answer judgment: 1.25

Session score:

`round(100 * earnedWeightedPoints / availableWeightedPoints)`

Category score:
- Weighted accuracy across completed scored questions stored locally.
- Maximum input history for displayed score: most recent 100 scored answers per category.
- Poll answers never affect WORK IQ.

Overall WORK IQ:
- Weighted mean of category scores for categories with answered questions.
- Do not invent a percentile.

Score states:
- 0–4 scored answers: `測定中`
- 5–14 scored answers: `仮測定`
- 15+ scored answers across at least 2 categories: `WORK IQ`

Display disclaimer near detailed score view.

## 16. Progress and review

Local persistence is sufficient for MVP.

Store in browser localStorage:
- Anonymous device ID
- Completed sessions
- Answers
- STEP unlock state
- Streak
- Review queue
- Recent question IDs
- Score history

Review intervals:
1 day → 3 days → 7 days → 30 days.

Wrong scored answer:
- Add to review queue due next day.

Correct review:
- Advance to next interval.

Wrong review:
- Reset interval to 1 day.

“昨日の振り返り”:
- Show yesterday’s score
- Show number of missed questions
- CTA: 「昨日の間違いを復習」

## 17. Streak

A day counts when the user completes:
- One 5-question scored session

Poll-only participation does not extend streak.

Use JST calendar dates.

## 18. Poll aggregation backend

Use Supabase Free for public MVP.

No personal account.

Store no:
- Name
- Email
- IP in application tables
- Phone
- Employer
- Exact age

Server-side environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANON_HASH_SALT`

Never expose service-role key to client code.

Poll vote flow:
1. Browser sends `pollId`, `optionId`, anonymous device token to Next.js route handler.
2. Server validates payload.
3. Server hashes anonymous token with server salt.
4. DB unique constraint `(poll_id, voter_hash)` prevents ordinary duplicate voting from same browser identity.
5. Server returns aggregated counts.
6. Client renders percentages.

This is sufficient for MVP validation, not fraud-proof voting.

## 19. Analytics

Use the same Supabase Free project.

Track only anonymous product events.

Allowed events:
- `landing_view`
- `daily_quiz_start`
- `quiz_start`
- `question_answered`
- `quiz_complete`
- `result_view`
- `share_click`
- `share_success`
- `poll_view`
- `poll_vote`
- `review_start`
- `review_complete`
- `learn_category_view`
- `cta_impression`
- `cta_click`

Do not send free-text user input.
Do not collect advertising IDs.
Do not fingerprint users.

Required event properties:
- anonymous hashed device ID
- event name
- route
- category if applicable
- step if applicable
- question ID if applicable
- session ID if applicable
- timestamp

No public analytics dashboard in MVP.
Provide SQL queries in repository docs for:
- landing → quiz start
- quiz completion rate
- share rate
- poll participation
- D1 return proxy
- D7 return proxy
- CTA click-through

## 20. Internal validation metrics

These are internal product targets, not claimed industry benchmarks.

Evaluate after:
- At least 500 unique anonymous visitors, and
- At least 100 completed quiz sessions.

Initial target signals:
- Landing → quiz start: 50%+
- Quiz completion among starters: 65%+
- Result share click: 3%+
- Next-day return: 10%+
- 7-day return: 5%+

Do not interpret one metric in isolation.

Primary continuation criterion:
Evidence that users voluntarily complete sessions and return without paid incentives.

## 21. HONNE / BEFoAF promotion

Objective:
Promote naturally without damaging quiz trust.

Rules:
- Maximum one service CTA per result/poll screen.
- No pop-up.
- No forced redirect.
- No interruption between quiz questions.
- No claim that the user “has a problem” based on score.
- CTA must be context-based.

HONNE:
Show after judgment/risk results when relevant.

Copy direction:
「仕事のことを、第三者と整理してみる」

BEFoAF:
Show after poll questions tagged `communication`, `relationship`, or `social`.

Copy direction:
「リアルなコミュニケーションを楽しむ」

Production URLs:
- `NEXT_PUBLIC_HONNE_URL`
- `NEXT_PUBLIC_BEFOAF_URL`

If URL is missing:
Hide the CTA. Do not guess a destination.

Track impression and click.

## 22. Social sharing

Primary:
Web Share API on supported mobile browsers.

Fallback:
Copy share text + URL to clipboard.

Share text example:
「WORK IQ 82。今日の5問に挑戦しました。あなたの社会人力は何点？」

Do not show:
- “全国上位○%”
- Fake ranking
- Fake participant count

Result URL can encode non-sensitive display state or reference a local session.
If a share receiver cannot access the sender’s local session, route them to a generic challenge landing page.

MVP does not require server-generated personalized image cards.
That can be Phase 2 if share rate justifies it.

## 23. Visual design

Mobile first.

Primary viewport:
390 × 844 px.

Desktop:
Centered content column, max width approximately 720 px.

Color direction:
- Background: white / very light neutral
- Text: near black
- Accent: clean blue
- Status colors must meet contrast requirements

Typography:
Use system Japanese font stack. No paid font.

Suggested stack:
`-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif`

UI:
- Rounded cards
- Large score numerals
- Clear hierarchy
- Minimum 44 px touch targets
- Strong selected states
- Visible focus states
- Avoid excessive gradients
- Avoid gamification that feels childish

Motion:
150–250 ms subtle transitions.
Respect `prefers-reduced-motion`.

## 24. Accessibility

Target WCAG AA behavior.

Must include:
- Keyboard usable choices
- Visible focus
- Semantic buttons
- Proper heading order
- `aria-live` for answer feedback where appropriate
- Contrast-safe text
- No color-only correctness indication
- 44 px touch target
- Responsive text
- Reduced-motion support

## 25. Technical stack

New standalone web app recommended.

Repository name:
`work-iq-web`

Runtime:
Node.js 24 LTS.

Framework:
Next.js 16.3.x, latest security patch in that branch.

UI:
React 19.2.x
TypeScript
Tailwind CSS 4.3.x

Validation:
Zod

Testing:
Vitest
React Testing Library
Playwright

Package manager:
npm unless existing repository already standardizes another package manager.

Deployment:
Existing Vercel environment, with no paid add-on enabled.

Do not downgrade an existing newer secure stack merely to match these numbers.

## 26. Proposed source structure

```text
src/
  app/
    page.tsx
    learn/
      page.tsx
      [category]/
        page.tsx
    quiz/
      daily/
        page.tsx
      [category]/
        step/
          [step]/
            page.tsx
    result/
      [sessionId]/
        page.tsx
    poll/
      page.tsx
    progress/
      page.tsx
    about/
      page.tsx
    privacy/
      page.tsx
    api/
      events/
        route.ts
      poll/
        current/
          route.ts
        vote/
          route.ts
  components/
    layout/
    home/
    quiz/
    result/
    poll/
    progress/
    cta/
  content/
    business-terms.json
    judgment.json
    risk.json
    current-affairs/
    polls/
  lib/
    domain/
      types.ts
      schemas.ts
    quiz/
      select-questions.ts
      session.ts
    scoring/
      work-iq.ts
    storage/
      local-progress.ts
    review/
      scheduler.ts
    poll/
      repository.ts
    analytics/
      track.ts
    cta/
      select-cta.ts
    share/
      share-result.ts
    time/
      jst.ts
    supabase/
      server.ts
  styles/
  test/
scripts/
  validate-content.ts
supabase/
  migrations/
docs/
  analytics_queries.sql
  content_guide.md
```

## 27. Privacy and security

- No account in MVP.
- No sensitive personal profile.
- No raw service role key in browser bundle.
- Validate all API payloads.
- Rate-limit logic may be simple for MVP but API must reject malformed payloads.
- Escape/render text safely using React.
- Current-affairs URLs must be HTTPS.
- No arbitrary HTML from content JSON.
- Privacy page must state localStorage, anonymous analytics, and poll vote storage.
- Do not claim poll data is scientifically representative.

## 28. Content quality rules

All evergreen questions:
- Japanese must sound natural in an actual workplace.
- Avoid trick questions.
- Avoid answer options that are obviously silly.
- Explanation must teach, not merely say “C is correct”.
- Business terms must teach timing and usage.
- Best-answer questions must mention assumptions or trade-offs.

Current affairs:
- Fact first, interpretation second.
- Cite source.
- Use absolute dates.
- Never publish stale question as “today”.
- Avoid unverified social-media claims.

## 29. Definition of done

Public MVP is complete only when all are true:

1. Mobile user can start without login.
2. Daily 5-question flow works end-to-end.
3. Three evergreen categories have STEP 1–5.
4. Current-affairs flow handles fresh and stale states correctly.
5. WORK IQ calculation is deterministic and tested.
6. STEP unlock rule is tested.
7. Review scheduling is tested.
8. Local progress survives refresh/reopen.
9. Daily poll hides aggregate until vote.
10. Daily poll returns real aggregate from free backend.
11. Duplicate ordinary vote from same browser identity is rejected.
12. Anonymous analytics records funnel events.
13. Result sharing works with clipboard fallback.
14. No fake rank or percentile is shown.
15. HONNE / BEFoAF CTA obeys context rule.
16. Missing CTA URL hides the card.
17. Privacy and About pages exist.
18. `npm run lint` passes.
19. Unit tests pass.
20. Playwright critical-flow tests pass.
21. `npm run build` passes.
22. Production secrets are not committed.
23. Mobile Lighthouse target: Performance >= 85, Accessibility >= 95 on core pages, under normal test conditions.
24. Public deployment requires zero new paid add-ons.

## 30. Post-MVP only after validation

Only consider these after real usage data:

- Login and cross-device sync
- Intermediate / advanced
- Full 9-category curriculum
- Personalized share image
- Demographic comparison
- Ranking
- PRO subscription
- Native app
- Runtime AI generation
- Automated news pipeline
- Notifications
- Admin CMS

The MVP must remain intentionally small until user behavior proves demand.
