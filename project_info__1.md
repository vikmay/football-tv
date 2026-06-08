# Football TV — Codebase Overview

## Summary

A zero-backend static site that scrapes and displays Ukrainian football match data (UPL, Ukrainian Cup, European cups, national team, and the 2026 World Cup) with live standings tables. The data pipeline runs as a Node.js script (`parse.js`) that pulls from multiple web sources (upl.ua, Flashscore, TheSportsDB, uaf.ua, worldcupstats.football), merges/deduplicates results, and writes `matches.json`. A GitHub Actions workflow auto-runs the scraper hourly and commits updates. The frontend (`index.html`) is a pure client-side HTML/CSS/JS page that loads `matches.json` via `fetch()` and renders match cards grouped by date, plus UPL and World Cup standings tables. No build step, no bundler, no server — everything is served as static files on GitHub Pages.

## Architecture

The system is a **two-tier static pipeline**: a server-side data collector (Node.js cron job) and a client-side renderer (vanilla JS).

**Data pipeline (parse.js):**

1. Reads cached `matches.meta.json` to check TTL — if fresh enough, skips fetch.
2. Launches parallel fetches for each competition from 1–3 sources each:
    - **UPL**: official upl.ua calendar → Flashscore results → Flashscore fixtures → TNT Sports → TheSportsDB API (ordered by preference)
    - **Ukrainian Cup**: uaf.ua official site → Flashscore feed data → hardcoded fallback events
    - **Champions League**: Flashscore feed data → TheSportsDB API
    - **Extra competitions** (Europa League, Conference League, UEFA Super Cup, Nations League, World Cup, Euro): Flashscore pages → TheSportsDB API
    - **World Cup standings**: worldcupstats.football (12 group pages)
    - **UPL standings**: upl.ua official table page
3. Each source's events are parsed via source-specific HTML/text parsers.
4. Events go through multi-layer deduplication: `dedupeEvents()` → `mergeCupEvents()` → `mergeCurrentAndPreviousMatches()` → `dedupeScheduleSections()` → `filterMatchesWithinWindow()`.
5. Output is written to `matches.json` (15 sections: UPL, UPL standings, 8 competition sections, aggregated club/national team sections, World Cup group standings).
6. Meta is written to `matches.meta.json` with adaptive TTL.

**Frontend (index.html):**

1. Fetches `matches.json` on load (with cache-busting timestamp).
2. Renders World Cup group standings from the `"Таблиця ЧС 2026"` data or falls back to live fetch from worldcupstats.football.
3. Filters all matches to show only World Cup matches (`league === "Чемпіонат світу"`) within an 8-day window before/after today.
4. Deduplicates matches by identity (date+league+normalized home+away), preferring entries with scores, then with finished status.
5. Groups by date, renders day headers (with "Сьогодні" for current date), then match cards.
6. Auto-scrolls to today's section on first load.

**Technology stack:**

- **Runtime**: Node.js 24 (scraper), no dependencies (uses built-in `fetch` and `fs`)
- **Frontend**: Vanilla HTML5/CSS3/ES6+ (no frameworks, no bundlers, no npm)
- **CI/CD**: GitHub Actions with `actions/checkout@v5`, `actions/setup-node@v4`
- **Hosting**: GitHub Pages (static site from root)
- **Data format**: JSON (no database)

## Directory Structure

```
football-tv/
├── index.html              — Frontend: renders matches + standings, pure client-side
├── parse.js                — Data pipeline: scraper/merger/writer (~2450 lines)
├── matches.json            — Generated match data (committed, updated by CI)
├── matches.meta.json       — Cache metadata (TTL, lastUpdated, forceRefresh)
├── README.md               — Project documentation (Ukrainian)
├── .github/
│   └── workflows/
│       └── update.yml      — GitHub Actions: hourly cron + manual dispatch
├── .git/                   — Git repository
├── .sixth/                 — Sixth exploration tool workspace
└── tmp/                    — Temporary debugging scripts (not part of project)
```

## Key Abstractions

### 1. `main()` — Orchestrator

- **File**: `parse.js` (~line 1980)
- **Responsibility**: Entry point. Checks cache, launches parallel fetches, merges all results, deduplicates, writes output.
- **Lifecycle**: Called once per script execution. Async. Wraps all logic. Catches fatal errors.
- **Key behavior**: Reads `existingData` from `matches.json` at startup (line 12-17) to preserve data if fetches fail. Sections are initialized from existing data as fallback arrays.

### 2. Event → Match Mapping (`mapEventToMatch()`)

- **File**: `parse.js` (~line 1050)
- **Responsibility**: Converts a raw event object (from any source) into a standardized match object for `matches.json`.
- **Normalization**: Calls `formatTime()`, `formatDateUk()`, `formatScore()`, `formatCompetitionLabel()`, `normalizeMatchSnapshot()`. Accepts a team name mapper function (`getUplTeamName` or `getWorldCupTeamName`).

### 3. Team Name Normalization System

- **File**: `parse.js` (~lines 92–345)
- **Three parallel systems**:
    - `uplTeamNames` (object): Maps ~80 English/Cyrillic variants to canonical Ukrainian names. Used server-side in `getUplTeamName()`.
    - `worldCupTeamNames` (object): Maps ~90 English country names to Ukrainian. Used server-side in `getWorldCupTeamName()` and client-side in the frontend.
    - `flashscoreClubAliases` (object): Maps lowercase normalized names to canonical forms for deduplication key matching. Used by `normalizeClubLookupName()`.
    - `normalizeMatchTeamName()` (frontend): Client-side alias map for display normalization (handles «» quotes, short forms).
- **Why this complexity**: Different sources (upl.ua, Flashscore, TheSportsDB, TNT) return the same team as "Динамо", "Dynamo Kyiv", "Динамо К.", "Dynamo (K)", etc. Without normalization, the same match appears multiple times with different spellings.

### 4. Deduplication Pipeline (6-stage)

- **File**: `parse.js` (~lines 760–1030)
- Stages in order:
    1. `dedupeEvents()` — Within a single source, groups by time+teams+date, picks best quality (has score > no score, longer idEvent).
    2. `mergeCupEvents()` / `mergeEventMetadata()` — Across two sources for the same competition (e.g., UPL official vs Flashscore results). Prefers finished+scores.
    3. `mergeCurrentAndPreviousMatches()` — New data vs cached data. Uses a scoring system (status rank + name length + idEvent length) to pick the best version.
    4. `dedupeMatchesByPairKeepLatestDate()` — For UPL only: removes old-date entries when a match is rescheduled. Keeps the latest date per home+away pair.
    5. `dedupeScheduleSections()` — Cross-section deduplication. Removes a match from "УПЛ" if it also appears in "Українські клуби в Європі" with the same identity.
    6. `filterMatchesWithinWindow()` — ±8 days from today (Kyiv time).
- **Key invariant**: A match object with `score` and `status === "Match Finished"` can never be replaced by a version without a score or with a non-finished status, _unless_ the scores differ (to fix stale 0-0).

### 5. Cache/TTL System

- **File**: `parse.js` (~lines 30–75) + `matches.meta.json`
- **Three TTL tiers**:
    - `DEFAULT_REFRESH_TTL_MINUTES = 120` — No matches today or tomorrow
    - `ACTIVE_REFRESH_TTL_MINUTES = 10` — Has matches today or tomorrow
    - `RECENT_RESULTS_TTL_MINUTES = 5` — Has finished matches from yesterday or today
- **Forced refresh flags**: `--force`, `--refresh`, `--refresh-now`, `FORCE_REFRESH=1` env var
- **CI always uses `FORCE_REFRESH=1`** — never reuses cached data on GitHub Actions

### 6. Source-Specific Parsers

- `parseOfficialUplEvents(html)` — upl.ua calendar page (`.tour-date`, `.tour-match` divs with `.resualt` block)
- `parseFlashscoreCupFeedData(data)` — Extracts from `cjs.initialFeeds['results']` / `cjs.initialFeeds['fixtures']` which contain `~AA÷`-separated binary blocks with `AD÷<unix_timestamp>`, `CX÷<home>`, `AF÷<away>`, `AG÷<score>` markers
- `parseFlashscoreUplSummaryResults(data)` — Same feed format but from `summary-results` / `summary-fixtures`
- `parseTntUplEvents(html)` — TNT Sports calendar page (`.section-title-4` date headers, `match-card` divs)
- `parseCupUafEvents(html)` — uaf.ua plain text extraction with regex patterns
- `parseFlashscoreFixtureEvents(html)` — Generic Flashscore fixtures HTML parsing via date chunks
- `fetchUplStandingsFromOfficialPage(html)` — upl.ua standings table (`table.table-gray.table-num`)

### 7. Frontend `load()` Function

- **File**: `index.html` (~line 290)
- **Responsibility**: Entry point for the client-side app. Fetches JSON, renders standings + matches, handles deduplication, date grouping, today scroll.
- **Key logic**: World Cup matches only (filtered by `league === "Чемпіонат світу"`). Local data takes priority for standings; falls back to live `worldcupstats.football` fetch (which is often CORS-blocked from `file://`).

### 8. Frontend `renderWorldCup2026GroupsStandings()`

- **File**: `index.html` (~line 210)
- **Two modes**:
    - **Local mode**: Uses `standingsByGroup` from `matches.json["Таблиця ЧС 2026"]` — no CORS issues
    - **Fallback mode**: Fetches each of 12 group pages from `worldcupstats.football/groups/{letter}/`, parses the `.standings-table` HTML, and renders. This may fail from `file://` due to CORS.

## Data Flow

### Match Data Flow

1. `parse.js` starts → reads `matches.json` into `existingData`
2. Checks `shouldReuseCachedMatches()` using `matches.meta.json` TTL
3. If cache expired or forced → launches parallel fetches:
    - `fetchUplEvents()` → tries 5 sources in order
    - `fetchUplStandings()` → upl.ua official table
    - `fetchChampionsLeagueEvents()` → Flashscore → TheSportsDB
    - `fetchCupEvents()` → uaf.ua → Flashscore → fallback events
    - `fetchExtraMatches()` → 6 competitions × (Flashscore + TheSportsDB)
    - And World Cup standings via `fetchWorldCup2026GroupStandings()` (but result is assigned to `wcGroupStandings` from the `Promise.all` destructuring — NOTE: `wcGroupStandings` is destructured from the array but **not passed** to the `Promise.all()` at line 2010, making it `undefined` — this may be a bug)
4. Each fetcher returns an array of `event` objects (from TheSportsDB format) or `null`
5. Events are mapped via `mapEventToMatch()` → standardized match objects
6. New matches merged with existing via `mergeCurrentAndPreviousMatches()`
7. Deduplication stages applied: `dedupeMatchesByPairKeepLatestDate()` → `dedupeScheduleSections()` → `filterMatchesWithinWindow()`
8. World Cup group standings fetched separately and stored under `"Таблиця ЧС 2026"`
9. `matches.json` written, `matches.meta.json` updated with new timestamp + TTL
10. On GitHub Actions → `git commit` + `git push` if files changed

### Frontend Render Flow

1. `load()` called on page load
2. Fetches `./matches.json?cache={timestamp}`
3. Calls `renderWorldCup2026GroupsStandings()` with `data["Таблиця ЧС 2026"]`
4. Extracts all array values from data, filters to `m?.league === "Чемпіонат світу"`
5. Sorts by date+time, deduplicates by identity (preferring scores)
6. Applies 8-day date window filter
7. Groups by `dateIso`, ensures today exists even if empty
8. Renders day headers (with red "Сьогодні" class) and match cards
9. Scrolls to today's section

## Non-Obvious Behaviors & Design Decisions

### Why the frontend only shows World Cup matches

The frontend code at line 324 explicitly filters `m?.league === "Чемпіонат світу"` — it does NOT show UPL, Champions League, or any other league matches in the match list. The UPL and World Cup standings are rendered separately. This is intentional: the page is focused on the 2026 World Cup, while the data collector (`parse.js`) still actively gathers all competitions.

### The `wcGroupStandings` bug

In `main()` at line ~2010, the `Promise.all()` returns `[uplEvents, uplStandings, clEvents, cupEvents, extraMatches]` — only 5 results. But the destructuring includes `wcGroupStandings` as the 6th variable. Since `fetchWorldCup2026GroupStandings()` is never called in the `Promise.all`, `wcGroupStandings` is always `undefined`. This means `matches["Таблиця ЧС 2026"]` will always be `{}` (empty object) in the output. The frontend falls back to live fetching from worldcupstats.football.

### Flashscore feed format complexity

Flashscore embeds match data in `<script>` tags as `cjs.initialFeeds['results']` / `cjs.initialFeeds['fixtures']` containing a proprietary binary-ish format using delimiters like `~AA÷`, `AD÷<unix>`, `CX÷<home>`, `AF÷<away>`, `AG÷<score>`. The parser `parseFlashscoreCupFeedData()` splits on `~AA÷` and extracts fields via regex. This is fragile — Flashscore changes this format periodically.

### The "00:00" time problem

Multiple sources (especially Flashscore fixtures HTML) produce `"00:00"` as the kickoff time when the actual time isn't available in the parsed data. The UPL deduplication at `dedupeScheduleSections()` explicitly filters out matches with `time === "00:00"` or `"00:00:00"` for the "УПЛ" section (line ~980), but the World Cup section does not have this filter — hence entries with `"time": "00:00"` appear in `matches.json`.

### Three-layer team name aliasing

There are three separate alias systems because they serve different purposes:

- **Server-side `uplTeamNames`** — maps English or short Cyrillic names to canonical Ukrainian for match output
- **Server-side `flashscoreClubAliases`** — maps normalized lowercase names for deduplication keys (preventing duplicate rows when the same match appears from two sources with different spellings)
- **Client-side `normalizeMatchTeamName()`** — handles display normalization (removes «» quotes, deduplicates doubled names like "Епіцентр Епіцентр", applies UPL-specific city suffixes)

### Adaptive TTL rationale

The TTL shortens when matches are happening (today/tomorrow) or recently finished because scores change frequently during match days. During off-seasons, a 120-minute TTL reduces unnecessary API calls. The 5-minute TTL for recent finished matches ensures scores are captured quickly after matches end.

### Race condition handling in CI

The GitHub Actions workflow includes `git pull --rebase origin "$branch"` before pushing to handle the case where the remote repo has been updated between the workflow starting and the push attempt. The workflow also uses concurrency group `update-matches` with `cancel-in-progress: false` to queue runs instead of cancelling (since each run may produce a commit that the next needs).

### Fallback events for Ukrainian Cup

The function `getCupFallbackEvents()` contains hardcoded semifinal matches for the 2025-2026 Ukrainian Cup season (Буковина vs Динамо, Металіст 1925 vs Чернігів). These are used when the uaf.ua website is unreachable. The fallback events are filtered by date window before use.

### `normalizeMatchSnapshot()` purpose

This function ensures that a match with `status === "Match Finished"` but no score (empty string) gets its status changed — actually, the code at line ~670 shows it preserves "Match Finished" if there IS a valid score, otherwise keeps the existing status. This prevents marking a match as finished prematurely when we only have a time but no result.

### MLB filtering

The World Cup section filters out MLB team names (line ~2035 in parse.js) because Flashscore sometimes mis-categorizes baseball matches under "world-championship". The `nonSoccerTeams` set contains all 30 MLB team names.

### The `isActiveWindowData` + `hasRecentFinishedMatches` combo

Two separate functions because they serve different TTL tiers:

- `isActiveWindowData` — checks if any match has `dateIso === today` or `dateIso === tomorrow` → triggers 10-minute TTL
- `hasRecentFinishedMatches` — checks if any match has `status === "Match Finished"` from yesterday or today → triggers 5-minute TTL (highest refresh rate)

## Module Reference

| File                           | Purpose                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `parse.js`                     | Entire data pipeline: multi-source scraper, parser, deduplicator, JSON writer (~2450 lines)  |
| `index.html`                   | Client-side frontend: fetches JSON, renders match cards + standings (~500 lines HTML+CSS+JS) |
| `matches.json`                 | Generated output: all match data organized by competition section                            |
| `matches.meta.json`            | Cache metadata: `lastUpdated` ISO timestamp, `ttlMinutes`, `forceRefresh` boolean            |
| `.github/workflows/update.yml` | CI pipeline: hourly cron with `FORCE_REFRESH=1`, auto-commit + push                          |

## Suggested Reading Order

1. **`README.md`** — Project overview, setup instructions, data format spec (4 minutes)
2. **`parse.js` lines 1–100** — Entry point, cache logic, TTL system, constants — establishes the core orchestration pattern (5 minutes)
3. **`parse.js` lines 92–345** — Team name normalization systems — the key to understanding why deduplication works (10 minutes)
4. **`parse.js` lines 760–1030** — Deduplication pipeline (functions `dedupeEvents` through `filterMatchesWithinWindow`) — the most complex and important part of the codebase (15 minutes)
5. **`parse.js` lines 1980–end** — `main()` function — how everything fits together (10 minutes)
6. **`index.html`** — Client-side rendering: data loading, deduplication, date grouping, standings rendering (15 minutes)

## Known Issues / Potential Improvements

1. **`wcGroupStandings` is never fetched** — `fetchWorldCup2026GroupStandings()` is defined but never called in the `Promise.all` pipeline. The frontend's local data path for World Cup standings is always empty.
2. **"00:00" times in World Cup matches** — No time-filtering for World Cup, so entries with unknown kickoff times appear. Many World Cup matches show `"time": "00:00"` or `"time": "00:00"` twice (duplicate entries from different sources with/without times).
3. **World Cup match duplicates** — Same match appears with `"time": "00:00"` and with a real time (e.g., "Мексика – Південна Африка" appears twice: once with 00:00, once with 22:00). The frontend deduplication prefers the one with a score, but neither has a score, so both may appear.
4. **No `package.json`** — The project has no npm dependencies, but a `package.json` with `"type": "module"` or at minimum a `.node-version` would clarify the runtime requirements.
5. **Frontend only shows World Cup matches** — Despite collecting 10+ competitions, the UI only renders "Чемпіонат світу" matches. Other competitions are collected but never displayed.
