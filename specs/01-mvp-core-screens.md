# SPEC 01 — MVP: core screens (library, detail, leaderboard, auth)

> **Status:** implemented
> **Depends on:** —
> **Date:** 2026-08-08
> **Objective:** Port the four non-game screens (library, game detail, hall of fame, auth) and shared nav/layout from the static `resources/templates/` prototype into a real Next.js App Router implementation, with mock data and fake local auth, excluding the actual playable game screen.

## Scope

**In:**

- Root layout (`app/layout.tsx`) with the shared `Nav` component and footer, replacing the current `create-next-app` scaffold.
- Library / home screen (`/`) — search box, category chips, game grid, game cards. Ports `biblioteca.jsx`.
- Game detail screen (`/games/[id]`) — cover, tags, description, stats, leaderboard aside, "JUGAR AHORA" action. Ports `detalle.jsx`.
- Leaderboard screen (`/leaderboard`) — per-game tabs, podium (top 3), full ranking table, "your score" row when logged in. Ports `salon.jsx`.
- Auth screen (`/login`) — login/signup tabs, guest access, fake session creation. Ports `auth.jsx`.
- Fake local session: storing/reading the logged-in user from `localStorage` (`av_user`), exposed to the whole app via a small client-side session provider.
- Mock game catalog and leaderboard rows ported from `data.jsx` (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) into a typed module.
- Visual design (arcade/neon/CRT theme) rebuilt using Tailwind CSS v4 utility classes, matching the prototype's look (colors, spacing, type).
- Mobile nav (hamburger + slide-in panel), ported from `nav.jsx`.

**Out of scope (for future specs):**

- The actual playable game screen (`reproductor.jsx` / `GamePlayer`) — explicitly deferred.
- Saving real scores (`av_scores` in the prototype) — no score-saving exists in this spec since there is no game to generate a score.
- Real backend/API authentication — this spec keeps the prototype's fake, client-only session.
- Real-time or persisted leaderboard data — leaderboard rows stay pseudo-random mock data (`seededScores`), not backed by real plays.
- Credits/coin economy — the nav's "CRÉDITOS · 03" stays a static, non-functional label.
- Any of the individual game implementations themselves.

## Data model

```ts
// lib/data.ts
type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string; // CSS class / token selecting the cover art
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;
};

type ScoreRow = { rank: number; name: string; score: number; date: string };

// GAMES: Game[] — ported verbatim from resources/templates/data.jsx
// CATS: string[] — category filter list, includes "TODOS"
// PLAYERS: string[] — name pool used by seededScores
// seededScores(seed: number, count?: number): ScoreRow[] — same deterministic pseudo-random generator
```

```ts
// lib/session.ts
type Session = { name: string } | null;
// localStorage key: "av_user" — same key as the prototype, JSON-encoded Session
```

Conventions:

- All UI copy stays in Spanish, matching the prototype's text, even though route segments are in English.
- `lib/data.ts` and `lib/session.ts` are plain TypeScript modules with no framework dependency, so both server and client components can import the types; `seededScores`/`GAMES` are pure data usable anywhere, while `localStorage` access in `lib/session.ts` only runs client-side.

## Implementation plan

1. Add `lib/data.ts` with `Game`, `ScoreRow` types, `GAMES`, `CATS`, `PLAYERS`, and `seededScores`, ported from `resources/templates/data.jsx`. Manual test: import and log `GAMES.length` from a scratch script or temporary console.log in a page.
2. Add `lib/session.ts` with `getSession()`, `setSession(session)`, `clearSession()` reading/writing `localStorage["av_user"]`, guarded for SSR (`typeof window === "undefined"`).
3. Add `app/providers/session-provider.tsx`, a client component exposing `{ user, signIn, signOut }` via React Context, backed by `lib/session.ts`, initialized from `localStorage` in a `useEffect`.
4. Extend the Tailwind theme (`app/globals.css` `@theme` block, Tailwind v4 style) with the prototype's neon tokens: cyan/magenta/yellow/green accents, pixel/mono font families, background/line colors. Manual test: a throwaway element using one new utility renders the expected color.
5. Build `app/components/nav.tsx` (client component) porting `nav.jsx`: logo, desktop links (`Biblioteca` → `/`, `Salón de la Fama` → `/leaderboard`), credits label, auth button (login link or `{name} ▾` that signs out on click), mobile hamburger + slide-in panel. Uses `usePathname()` for active-link state and the session provider for `user`.
6. Update `app/layout.tsx` to wrap children with the session provider, render `Nav`, and a footer matching the prototype's copy/style.
7. Build `app/page.tsx` (library/home) porting `biblioteca.jsx`: hero header, search input, category chips, `GameCard` grid reading from `GAMES`, empty-state message. Cards link to `/games/[id]`.
8. Build `app/games/[id]/page.tsx` porting `detalle.jsx`: cover, tags, description, stat strip, leaderboard aside using `seededScores`, "VOLVER AL VAULT" link to `/`, and a "JUGAR AHORA" button rendered disabled with a "Próximamente" label/tooltip (no navigation, no `/games/[id]/play` route created in this spec).
9. Build `app/leaderboard/page.tsx` (client component, needs `user` from session) porting `salon.jsx`: per-game tab chips, podium, ranking table, "your score" row shown only when a session exists, "VOLVER A LA BIBLIOTECA" link to `/`.
10. Build `app/login/page.tsx` porting `auth.jsx`: login/signup tabs, username/email/password fields (no real validation, matches prototype), submit calls `signIn({ name })` then redirects to `/`; "JUGAR COMO INVITADO" calls `signIn(null)` and redirects to `/` without setting a user.
11. Remove/replace the leftover `create-next-app` scaffold content in `app/page.tsx`/`app/globals.css` once the real screens are in place, keeping the `AGENTS.md` warning block untouched per `CLAUDE.md`.

## Acceptance criteria

- [ ] `npm run dev` starts and `/` renders the library screen with no console errors.
- [ ] Typing in the search box filters the game grid by title (case-insensitive).
- [ ] Clicking a category chip filters the grid to that category; `TODOS` shows all games.
- [ ] Clicking a game card or its "JUGAR" button navigates to `/games/[id]` for that game.
- [ ] `/games/[id]` shows the game's cover, description, stats, and a leaderboard list of 10 rows.
- [ ] The "JUGAR AHORA" button on `/games/[id]` is disabled and does not navigate anywhere.
- [ ] `/leaderboard` shows a podium (top 3) and a full ranking table for the selected game tab; switching tabs changes the rows shown.
- [ ] Submitting the login form on `/login` with a username stores a session, redirects to `/`, and the Nav shows that username.
- [ ] Clicking "JUGAR COMO INVITADO" on `/login` redirects to `/` without setting a logged-in name in the Nav.
- [ ] With a session set, `/leaderboard` shows an extra "your score" row for the currently selected game.
- [ ] Clicking the username button in the Nav signs out immediately (no confirmation, no menu) and the Nav reverts to showing "Iniciar Sesión".
- [ ] Reloading the page after logging in keeps the user logged in (session persisted in `localStorage`).
- [ ] On a narrow viewport, the hamburger button opens a slide-in mobile nav panel with the same links.

## Decisions

- **Yes:** Next.js App Router file-based routes (`/`, `/games/[id]`, `/leaderboard`, `/login`) instead of the prototype's hash routing. Matches `CLAUDE.md`'s instruction to follow current Next.js conventions instead of the prototype's plain-React pattern.
- **Yes:** English route segments (`/games/[id]`, `/leaderboard`, `/login`) with Spanish UI copy kept as-is. User's explicit choice.
- **Yes:** Tailwind utility classes rebuild the prototype's visual design instead of porting `styles.css` verbatim. User's explicit choice, accepted the extra rebuild effort over `styles.css` reuse.
- **Yes:** Fake, client-only session via `localStorage["av_user"]`, same key and shape as the prototype. No backend in this spec.
- **Yes:** A small React Context session provider, because App Router pages are server components by default and several screens (`Nav`, `/leaderboard`, `/login`) need client-side `localStorage` access to the logged-in user.
- **No:** Game player screen (`reproductor.jsx`). Explicitly excluded by the user; belongs in its own future spec.
- **No:** Real score persistence (`av_scores`). There is nothing to save a score from until the game screen exists.
- **No:** Real backend authentication. Out of scope for the MVP; the prototype itself has no backend either.

## Risks

| Risk | Mitigation |
| --- | --- |
| `localStorage` unavailable (private browsing / disabled) | Wrap reads/writes in `lib/session.ts` in try/catch; treat failures as logged-out/guest, app keeps working without persistence. |
| Session read only happens client-side (`useEffect`), so first paint may briefly show "logged out" before hydration | Accepted as a minor MVP-level flash; not blocking, no server-side session read in this spec. |
| Tailwind utility rebuild visually diverges from the prototype's CRT/neon look | Use the prototype's exact color values and font choices (from `styles.css`) as the reference while building the Tailwind theme tokens in step 4. |

## What is **not** in this spec

- The playable game screen (`GamePlayer` / `reproductor.jsx`).
- Real score saving (`av_scores`).
- Real backend authentication or persistence.
- A working credits/coin economy.
- Any individual game's actual gameplay implementation.

Each of these, if it lands, goes in its own spec.
