# BetterBookmark: Learning Plan

> A companion to `ROADMAP.md`. The roadmap says **what** to build. This file says **what to learn, when, and how**.

---

## 1. Where you are right now

Based on a review of your previous attempt ([andyshin00/bookmark](https://github.com/andyshin00/bookmark)).

You're further along than you think. You already used several tools from the "new" stack, just by hand or in their basic form.

### What you can already do ✅

| Skill                   | Evidence in your old repo                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router      | Route handlers (`app/api/.../route.ts`), dynamic routes (`[id]`), a Server Component page that loads data and passes it to a Client Component |
| Drizzle + Neon          | `schema.ts`, `db.ts`, `drizzle.config.ts`, 10 migrations generated with drizzle-kit                                                           |
| Zod                     | Validating request bodies, catching `ZodError` → 422                                                                                          |
| Auth fundamentals       | bcrypt hashing, JWT signing and verifying, httpOnly cookies, a reusable `authenticate()` helper                                               |
| Security instinct       | You filter queries by `userId` (`and(eq(id), eq(userId))`)                                                                                    |
| Relational modeling     | A many-to-many `bookmark_tags` join table with a composite primary key                                                                        |
| React state             | `useState`, lifting state up, callback props (`onCreated`, `onDelete`)                                                                        |
| TypeScript              | Typed props, a discriminated union (`type View = { type: "all" } \| { type: "tag"; tagId } ...`), which is beyond "very basic"                |
| Chrome extension basics | Manifest V3, `chrome.tabs.query`, sending a token from the popup                                                                              |
| Metadata scraping       | Hand-written `og:image`/`<title>`/favicon extraction                                                                                          |

**Level:** an advanced beginner, moving into junior. You can build a working full-stack feature end-to-end. What's missing is mostly **database constraints, security edge cases, and the libraries that remove repetitive code**.

### The key insight

Most of the "new" tools on your list replace something you **already built by hand**:

| New tool               | What it replaces in your old code                                                       |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Better Auth**        | `utils/authenticate.ts`, `api/login`, `api/register`, `api/logout`                      |
| **TanStack Query**     | All the `useState` + `fetch` + `setBookmarks(prev => ...)` code in `BookmarkClient.tsx` |
| **React Hook Form**    | The `useState` for every field in `CreateBookmarkForm.tsx`                              |
| **open-graph-scraper** | Your regex functions `getMetaTagContent`, `getTitleFromHtml`, `getIconHref`             |
| **WXT**                | `extension/popup.js` with `document.querySelector`                                      |
| **nuqs**               | `const [view, setView] = useState<View>(...)`, which is lost when you refresh           |
| **cmdk**               | The "Search by title..." input that was never wired up                                  |
| **dnd-kit**            | Nothing yet (it's new). It's for folders, which you deleted in commit `9896a50`.        |

So you're not learning "10 random new things". You're learning **the proper tool for problems you've already hit**. That makes them much easier to learn.

---

## 2. Lessons from your old code

These are real bugs and gaps in the old repo. Each one teaches a concept, and the right-hand column says where you'll apply it in the new project. **Don't feel bad about them.** Finding these is how everyone learns.

| #   | What happened                                                                                                                                      | Concept to learn                                                            | Applied in |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| 1   | `bookmarks/page.tsx` runs `db.query.bookmarkTagsTable.findMany()` with **no `where`**, so it sends _every user's_ bookmark↔tag rows to the browser | Every query must be scoped to the user; join through `bookmarks.userId`     | Phase 3, 5 |
| 2   | `userId`, `bookmarkId` and `tagId` have **no foreign keys**, so you had to delete `bookmark_tags` rows by hand before deleting a bookmark          | Foreign keys (`.references()`) + `onDelete: "cascade"`                      | Phase 3    |
| 3   | Nothing stops two tags called "react" for the same user except your app code                                                                       | Unique constraints, e.g. `unique().on(userId, name)`                        | Phase 5    |
| 4   | Creating a bookmark + tags + join rows is 3 separate writes. If the 2nd fails you get half-saved data.                                             | Transactions (`db.transaction`)                                             | Phase 5    |
| 5   | `authenticate()` **throws** instead of returning `null`, so `if (!user) return 401` never runs and users get a 500 error                           | Error handling design; Better Auth's `getSession()` returns `null`          | Phase 2    |
| 6   | `jwt.sign()` has no `expiresIn`, so a stolen token works forever                                                                                   | Token and session expiry (Better Auth handles it)                           | Phase 2    |
| 7   | Login says "Invalid password" (422) vs 401 for an unknown email, which tells attackers which emails exist                                          | User enumeration; use the same message and status for both                  | Phase 2    |
| 8   | The server `fetch`es any URL the user types, including `http://localhost`, `http://169.254.169.254` etc.                                           | SSRF (Server-Side Request Forgery), timeouts                                | Phase 3    |
| 9   | `finalTitle` is computed from the page but **never used**. The insert uses `parsed.title`.                                                         | Read your own diff; TypeScript's "unused variable" lint rule                | Phase 3    |
| 10  | The `Bookmark` type is written by hand in `types/bookmark.ts` (your own comment mentions `$inferSelect`)                                           | `typeof bookmarks.$inferSelect`, which gives one source of truth            | Phase 3    |
| 11  | The favorite toggle lives in `/api/bookmarks/[id]/delete/route.ts` as `PATCH`                                                                      | REST conventions: `DELETE /api/bookmarks/[id]`, `PATCH /api/bookmarks/[id]` | Phase 3    |
| 12  | The extension stores the token in `localStorage` and sends `Authorization: <token>`                                                                | Bearer tokens, `chrome.storage`, cross-origin cookies                       | Phase 6    |

---

## 3. How we'll work together

### The loop (repeat for every roadmap step)

```
1. WHY      →  What problem does this tool solve? (Usually: "the thing you did by hand")
2. LEARN    →  Read ONLY the linked "just enough" docs (30–90 min max)
3. SPIKE    →  Tiny throwaway experiment in a scratch folder (optional, 30 min)
4. BUILD    →  Implement the step in the real project. YOU type the code.
5. REVIEW   →  Ask Claude: "review my changes". I explain issues; you fix them.
6. LOG      →  Write 3–5 lines in LEARNING-LOG.md: what you learned and what confused you
7. COMMIT   →  One small commit per step
```

### Rules

- **One new tool at a time.** Never introduce two new libraries in the same step.
- **You write the code.** I explain, give hints, show small examples and review. Ask for a full solution only when you're truly stuck, and then ask me to explain it line by line.
- **Docs before tutorials.** YouTube is fine for the big picture, but the official docs are the source of truth and are kept up to date.
- **Read the error message first.** Paste it to me together with what you think it means.
- **It's OK not to understand everything.** Aim for "I can use it and explain what it does", not "I know every option".

### Useful things to ask me

- "Explain [concept] like I know Express and JWT but not [X]."
- "Give me a hint for this step, not the answer."
- "Review my changes for bugs and security issues." (or `/code-review`)
- "Quiz me on what I just built."
- "Why did you suggest X instead of Y?"

---

## 4. Learning tracks, in build order

Each block uses the same format: **Why** → **Learn just enough** → **Practice** → **Done when**.

---

### 🔧 Phase 1: Setup

#### pnpm (½ day)

- **Why:** the same as npm, but faster and stricter. It also has **workspaces**, so one repo can hold the web app, the extension and the shared code.
- **Learn just enough:**
  - The command differences: `npm install` → `pnpm install`, `npm i x` → `pnpm add x`, `npx` → `pnpm dlx`, `npm run dev` → `pnpm dev`
  - What a workspace is, `pnpm-workspace.yaml`, and the `--filter` flag
- **Resources:**
  - https://pnpm.io/motivation (5 min, explains why it exists)
  - https://pnpm.io/workspaces
  - https://pnpm.io/filtering
- **Practice:** make a scratch folder with `packages/hello` (exports a function) and `apps/cli` (imports it using `"hello": "workspace:*"`).
- **Done when:** you can explain what `workspace:*` means.

#### Oxlint + Prettier (½ day)

**Decision:** Oxlint for linting, Prettier for formatting, no Vite+.

|           | ESLint                                      | Oxlint (chosen)                                                           |
| --------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| Speed     | Slower (JavaScript)                         | 50–100× faster (written in Rust)                                          |
| Ecosystem | Huge. Every plugin and tutorial assumes it. | Newer; has most popular rules built in (React, TypeScript, Next.js, a11y) |
| Next.js   | `create-next-app` sets it up for you        | A small manual setup                                                      |

- **Why:** a **linter** reads your code and warns about likely bugs, e.g. an unused variable like `finalTitle` in your old repo. A **formatter** only fixes style (spacing, quotes).
- **Heads-up:** tutorials usually say "add this ESLint rule". Oxlint usually has the same rule under the same name.
- **Learn:**
  - https://oxc.rs/docs/guide/usage/linter (Quickstart + Configuration)
  - https://prettier.io/docs/install
- **Done when:** `pnpm lint` and `pnpm format` work from the repo root, and VS Code shows Oxlint warnings (install the "oxc" extension).

> **Vite+ skipped:** Next.js uses Turbopack and WXT already includes Vite, so nothing in this project needs it. When we reach testing, Vitest gets installed on its own.

#### Monorepo setup (1 day)

- **Learn:** how `apps/web` imports from `packages/db` (package.json `name` + `exports`, and `"@betterbookmark/db": "workspace:*"`).
- **Resource:** https://pnpm.io/workspaces, and ask me to walk you through it as you set it up. This is the most "configuration-heavy" step, so it's fine to lean on me here.

---

### 🗄️ Ongoing tracks (15–30 min, a few times a week, throughout)

#### TypeScript

You already use union types. Now fill in the gaps.

- **Resources:**
  - Total TypeScript "Beginner's TypeScript" (free, interactive): https://www.totaltypescript.com/tutorials/beginners-typescript
  - The official handbook, "Everyday Types": https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
  - React + TS cheatsheet: https://react-typescript-cheatsheet.netlify.app/
- **Order:** everyday types → narrowing (`if`, `in`, discriminated unions) → generics (just _reading_ them, e.g. `useQuery<Bookmark[]>`) → `typeof` / `z.infer<typeof schema>` / `$inferSelect` (inferring types from values) → utility types (`Pick`, `Omit`, `Partial`)
- **Goal:** by Phase 5, most of your types come from Zod and Drizzle, not hand-written `type` blocks.

#### PostgreSQL / SQL

- **Resources:**
  - SQLBolt (interactive, 1–2 evenings): https://sqlbolt.com/
  - Neon's PostgreSQL tutorial: https://neon.com/postgresql/tutorial
- **Order:** SELECT/WHERE/ORDER BY → JOINs (you need these for tags) → **primary vs foreign keys** → **constraints** (`NOT NULL`, `UNIQUE`, `ON DELETE CASCADE`) → indexes (why `userId` should be indexed) → transactions → full-text search (Phase 5)
- **Habit:** after each migration, open `pnpm drizzle-kit studio` and look at the actual tables. Read the generated `.sql` migration file every time. It's the best way to learn SQL from Drizzle.

---

### 🔐 Phase 2: Authentication

#### Better Auth (3–5 days)

- **Why:** it replaces your `authenticate.ts`, login, register and logout routes. It also fixes lessons #5, #6 and #7 for free.
- **Mental model:** your old flow, but with **sessions in the database** instead of JWTs. The cookie holds a random session ID, and the `session` table maps it to a user.
- **Learn just enough:**
  1. Installation + Drizzle adapter: https://www.better-auth.com/docs/installation
  2. Basic usage (signUp, signIn, signOut, getSession): https://www.better-auth.com/docs/basic-usage
  3. Next.js integration (route handler, server-side `auth.api.getSession({ headers })`): https://www.better-auth.com/docs/integrations/next
  4. Drizzle adapter + schema generation: https://www.better-auth.com/docs/adapters/drizzle
- **Practice:** before writing any UI, sign up a user with a `curl` or REST client request and look at the `user`, `account` and `session` tables in Drizzle Studio. Where did the password hash go? (Answer: the `account` table.)
- **Done when:** you can explain to me what happens, step by step, between clicking "Log in" and the server knowing who you are on the next request.
- **Later (Phase 8):** Google/GitHub OAuth: https://www.better-auth.com/docs/authentication/google

#### React Hook Form + shadcn Form (1–2 days)

- **Why:** it replaces one `useState` per input, plus manual error state. It plugs your existing Zod schema straight in.
- **Learn:**
  - https://react-hook-form.com/get-started (read "Register fields", "Apply validation", "Handle errors", and the "Schema Validation" section with `zodResolver`)
  - shadcn's form guide: https://ui.shadcn.com/docs/forms/react-hook-form
- **Practice:** build the signup form with the **same Zod schema** on the client and the server (put it in `packages/shared`).
- **Done when:** a wrong email shows an error under the field without any `useState` from you.

---

### 🔖 Phase 3: Bookmarks CRUD

#### Drizzle, level 2 (2 days)

You know the basics. Now learn:

- `.references(() => users.id, { onDelete: "cascade" })`: https://orm.drizzle.team/docs/indexes-constraints
- Indexes and unique constraints (same page)
- `$inferSelect` / `$inferInsert`: https://orm.drizzle.team/docs/goodies#type-api
- Relations and `with:` queries (fetch a bookmark _with_ its tags in one call): https://orm.drizzle.team/docs/rqb
- **Done when:** deleting a bookmark automatically deletes its tag links, with no manual delete.

#### open-graph-scraper + SSRF (1 day)

- **Why:** it replaces your regex functions and handles weird HTML, encodings and redirects.
- **Learn:** https://github.com/jshemas/openGraphScraper (read the README examples and the `timeout` option)
- **Security:** read the "SSRF" section of OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html (15 min, skim). Then ask me to help you add a basic guard: only `http(s)`, block localhost and private IPs, and set a timeout.
- **Done when:** saving `https://github.com` shows the right title and image, and saving `http://localhost:3000` is rejected.

#### TanStack Query (3–5 days, the most important new tool)

- **Why:** look at `BookmarkClient.tsx`. It has 3 `useState`s holding server data, and every action manually patches them (`setBookmarks(prev => prev.map(...))`). TanStack Query manages server data for you: fetching, caching, loading and error states, and refetching after changes.
- **Mental model:**
  - **Queries** = reading data (`useQuery`)
  - **Mutations** = changing data (`useMutation`)
  - **Invalidation** = "this data is stale now, refetch it"
- **Learn (in this order):**
  1. Overview + Quick start: https://tanstack.com/query/latest/docs/framework/react/overview
  2. TkDodo's "Practical React Query" (_the_ best guide, by a maintainer): https://tkdodo.eu/blog/practical-react-query
  3. Mutations + invalidation: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
  4. **Later**, optimistic updates: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- **Practice:** first convert _only_ the bookmark list to `useQuery`. Then convert "delete" to `useMutation` + `invalidateQueries`. Optimistic updates come last.
- **Done when:** you delete a bookmark and the list updates without you writing any `setBookmarks`.

---

### 📁 Phase 4: Folders

#### Recursive data (folder trees) (1–2 days)

- **Why:** folders inside folders. You store a flat list with `parentId` and build the tree in JavaScript.
- **Learn:** self-referencing foreign keys in Drizzle (`parentId` references the same table), and converting a flat array into a tree (ask me for a guided exercise).
- **Done when:** the sidebar renders 3 levels of nested folders.

#### dnd-kit (3–4 days, the hardest UI library on the list)

- **Why:** dragging bookmarks into folders and reordering them.
- **Learn:**
  - Docs: https://docs.dndkit.com/ (read "Overview", then `DndContext`, `useDraggable`, `useDroppable`)
  - Then the Sortable preset: https://docs.dndkit.com/presets/sortable
- **Practice:** do a **throwaway spike** first: a page with 3 boxes and 5 draggable cards. Don't touch the real app until that works.
- **Then:** learn how to store order. Ask me about "fractional indexing" vs integer `position`. We'll pick the simpler option.
- **Done when:** you can drag a bookmark onto a folder in the sidebar and it moves (saved via a TanStack mutation).

---

### 🔎 Phase 5: Tags, search & sorting

#### nuqs (½–1 day)

- **Why:** your old `view` state is lost on refresh and can't be shared as a link. nuqs puts it in the URL (`?tag=react&sort=newest`) but you use it like `useState`.
- **Learn:** https://nuqs.dev/docs (Installation → Basic usage → Parsers)
- **Done when:** you refresh the page and stay on the same filter.

#### Postgres full-text search (1–2 days)

- **Learn:** Drizzle's guide: https://orm.drizzle.team/docs/guides/postgresql-full-text-search
- **Start simpler:** `ilike('%term%')` first. It works fine for hundreds of bookmarks. Upgrade to full-text search afterwards.

#### cmdk / shadcn Command (½ day)

- **Learn:** https://ui.shadcn.com/docs/components/command (it's cmdk underneath)
- **Done when:** ⌘K opens a box, you type, and you jump to a bookmark or folder.

---

### 🧩 Phase 6: Chrome extension

#### WXT (3–5 days)

- **Why:** your old extension was plain HTML + `document.querySelector`. WXT lets you write the popup in **React + TypeScript**, with hot reload and a build step.
- **Learn:**
  1. Chrome's own intro (concepts: manifest, popup, background service worker, permissions): https://developer.chrome.com/docs/extensions/get-started
  2. WXT installation + entrypoints: https://wxt.dev/guide/installation.html and https://wxt.dev/guide/essentials/entrypoints.html
  3. `chrome.storage` instead of `localStorage`: https://wxt.dev/guide/essentials/storage.html
- **Auth:** ask me when you get here. We'll connect Better Auth to the extension (`trustedOrigins` + cookies, or the bearer plugin). This is a tricky step and fine to do together.
- **Done when:** clicking the extension saves the current tab, and it appears in the web app.

---

### 📦 Phase 7+: "Later" tools (learn just in time)

**Don't study these in advance.** Learn each one when you hit the problem it solves.

| When you notice...                                   | Learn                                 | Start here                                          |
| ---------------------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| "I want 'Sign in with Google'"                       | Google / GitHub OAuth via Better Auth | better-auth.com/docs/authentication/google          |
| "Users need to reset their password"                 | Resend + React Email                  | resend.com/docs/send-with-nextjs                    |
| "Saving a bookmark is slow because of scraping"      | Background jobs (Inngest)             | inngest.com/docs/getting-started/nextjs-quick-start |
| "I want to store uploaded images"                    | Cloudflare R2 (S3 API)                | developers.cloudflare.com/r2                        |
| "Someone could spam my API"                          | Upstash rate limiting                 | upstash.com/docs/redis/sdks/ratelimit-ts/overview   |
| "Something broke in production and I don't know why" | Sentry                                | docs.sentry.io/platforms/javascript/guides/nextjs   |
| "Which features do people actually use?"             | PostHog                               | posthog.com/docs/libraries/next-js                  |
| "I keep re-testing the same flows by hand"           | Vitest (units), then Playwright (E2E) | vitest.dev/guide, playwright.dev/docs/intro         |
| "My API types between client and server drift apart" | tRPC                                  | trpc.io/docs/quickstart                             |
| "Builds are slow"                                    | Turborepo                             | turborepo.com/docs                                  |
| "I want to charge money"                             | Stripe or Polar                       | better-auth.com/docs/plugins/stripe                 |

---

## 5. Suggested weekly rhythm

| Day     | Activity                                                                       |
| ------- | ------------------------------------------------------------------------------ |
| 1       | Read the "Learn just enough" links for the next step (≤ 90 min)                |
| 2–4     | Build the step. Ask questions while you go.                                    |
| 5       | Ask for a code review, fix the issues, commit                                  |
| Weekend | 30 min of TypeScript or SQL from the ongoing tracks + update `LEARNING-LOG.md` |

Rough timeline at this pace: Phases 1–3 take about **4–6 weeks**, and a working app with folders, search and the extension takes about **3–4 months**. Going slower is fine; understanding beats speed.

---

## 6. Your first three steps

1. Do SQLBolt lessons 1–6 + 12 (one evening) and read Drizzle's "indexes & constraints" page.
2. Skim the Oxlint quickstart (see Phase 1 above), since it's part of the first setup.
3. Start Phase 1, "pnpm" → "Monorepo setup", and ask me to walk you through the workspace config.
