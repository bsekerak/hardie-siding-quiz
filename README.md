# James Hardie Siding Journey Guide & Product Selector

A production-ready Next.js 15 (App Router) application that plays two roles at once:

1. **Journey Guide** — identifies the homeowner's funnel stage (need, insurance, justify, dream,
   estimate, selection), surfaces the technical questions they don't know to ask (pre-1978 lead
   paint, continuous insulation, WUI fire zones, hail matching rules), and gives one clear next step.
2. **Product Selector** — produces a concrete James Hardie specification: Hardie® Zone product line,
   profile, texture, ColorPlus® finish, HardieTrim® package and Trim-Over install method, with a
   transparent cost range and a contractor interview sheet.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 3 with the Hardie theme tokens |
| Icons / Motion | `lucide-react`, `framer-motion` |
| State | React Context (`QuizContext`) with automatic `localStorage` sync |
| Data | Client-side static rule matrices and lookup tables — no backend, no network calls |

Theme tokens: Deep Hardie Green `#16382C`, Slate Charcoal `#1E293B`, Warm Stone `#F4F1EA`,
Crisp White `#FFFFFF`, Accent Gold `#C8963E`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npm run typecheck
```

## Architecture

```
src/
  app/               Routes: / (landing), /quiz, /results, not-found
  components/
    landing/         ResumeBanner (client, hydration-safe)
    quiz/            QuizEngine, QuestionRenderer, OptionGrid, ChipGroup, ZipInput, ProgressBar
    results/         Dashboard and its eight sections
    ui/              Button, Icon registry, Callout, header, footer, cn helper
  context/           QuizContext — answers, routing, localStorage persistence
  data/              questions, climate/ZIP tables, siding profiles, ColorPlus colors
  lib/               engine (rule matrices), flow (skip logic), finance, planExport
  types/             The whole domain model as string-literal unions
```

### Adaptive flow

All 14 questions live in `src/data/questions.ts`. `src/lib/flow.ts` owns visibility and validation:
Q2 ("What are you seeing?") renders only when Q1 sets stage `need` or `insurance`; every other stage
routes straight to Q3. `isStepAnswered` gates the Continue button, and `isQuizComplete` gates the
results dashboard.

### Hydration safety

`QuizContext` never reads `localStorage` during render. Initial state is the empty answer set, the
stored session is loaded in a mount effect, and `hydrated` gates any storage-derived UI. Server HTML
and first client render are therefore always identical — `/quiz` and `/results` server-render a
deterministic skeleton.

### The rule engine

`src/lib/engine.ts` is pure and synchronous: `buildPlan(answers) -> SidingPlan`. It composes the
stage action, climate profile, product spec, three palettes, the cost estimate, the hidden-cost audit
and the contractor questions. Because it is pure, it can be unit tested directly and re-run on any
answer change without side effects.

### Hardie Zone derivation

`src/data/climate.ts` resolves the state from a three-digit ZIP prefix table, then assigns HZ5® or
HZ10® from that state, plus flags for hail corridor, WUI wildfire exposure, coastal salt air, cold
IECC zones and freeze/thaw. The source specification's first-digit ZIP rule is retained as
`zoneFromFirstDigit` and can be re-enabled with the `USE_SPEC_FIRST_DIGIT_RULE` constant — see the
comment there for why the state-derived mapping is the default.

## Disclaimers built into the UI

Cost figures are directional planning estimates from national installed-price bands, not quotes.
Color swatches are screen approximations. Code, permit and insurance-matching requirements vary by
jurisdiction. All three statements are surfaced in the product, not buried here.

## Deploy

Fully static — every route prerenders. `npx vercel --prod`, or any host that serves a Next.js build.
