# BetterBookmark: Roadmap, Architecture & Tech Stack

> A better bookmark manager than Chrome's built-in one: a web app where you log in, save bookmarks, organize them into nested folders, tag, search and sort them, plus a Chrome extension to save pages in one click.
> Inspired by Raindrop.io and Bookmarkify.

---

## 1. Tech Stack

Tools are grouped by **when you need them**. Don't install the "Later" ones until you reach that phase.

### Core (needed from day 1)

| Tool                     | What it does (in plain English)                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **pnpm**                 | Package manager (like npm, but faster). Its "workspaces" feature lets one repo hold several apps.                                          |
| **TypeScript**           | JavaScript with types. Catches mistakes before you run the code.                                                                           |
| **Next.js (App Router)** | The web app framework: pages, routing, and server code (API endpoints) in one project.                                                     |
| **React**                | UI library that Next.js is built on.                                                                                                       |
| **Tailwind CSS v4**      | Styling with utility classes (`flex`, `p-4`, `text-sm`).                                                                                   |
| **shadcn/ui**            | Pre-built, good-looking components (buttons, dialogs, dropdowns) that get copied into your project, so you own and can edit them.          |
| **lucide-react**         | Icon set (shadcn uses it).                                                                                                                 |
| **PostgreSQL**           | The database. Tables, rows, SQL.                                                                                                           |
| **Neon**                 | Hosts your Postgres database in the cloud. Free tier, nothing to install.                                                                  |
| **Drizzle ORM**          | Lets you write database queries in TypeScript instead of raw SQL, with autocomplete.                                                       |
| **drizzle-kit**          | Drizzle's CLI: creates and runs **migrations** (versioned changes to your tables) and has a visual DB browser (`drizzle-kit studio`).      |
| **Better Auth**          | Auth library. Handles signup, login, password hashing, sessions and cookies, which is what you previously wrote by hand with bcrypt + JWT. |
| **Zod**                  | Validates data (e.g. "is this a valid URL?") on both the frontend and the backend.                                                         |

### Added as the app grows

| Tool                   | Phase | What it does                                                                                                                       |
| ---------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **TanStack Query**     | 3     | Fetches and caches data on the client, and makes "optimistic updates" easy (the UI updates instantly, before the server responds). |
| **React Hook Form**    | 2     | Form state and validation (pairs with Zod).                                                                                        |
| **sonner**             | 2     | Toast notifications ("Bookmark saved!"). It ships with shadcn.                                                                     |
| **next-themes**        | 2     | Dark/light mode.                                                                                                                   |
| **dnd-kit**            | 4     | Drag and drop (move bookmarks into folders, reorder).                                                                              |
| **nuqs**               | 5     | Keeps filters, sort and search in the URL (`?sort=newest&tag=react`).                                                              |
| **cmdk**               | 5     | ⌘K command palette for quick search. It ships with shadcn.                                                                         |
| **open-graph-scraper** | 3     | Reads a URL's title, description, preview image and favicon.                                                                       |
| **WXT**                | 6     | Framework for building Chrome extensions with React + Vite.                                                                        |
| **Vitest**             | 2+    | Unit tests. Installed on its own (no Vite+ in this project).                                                                       |
| **Oxlint**             | 1     | Linting: warns about bugs and bad patterns. Written in Rust, much faster than ESLint.                                              |
| **Prettier**           | 1     | Code formatting (consistent quotes, spacing, line breaks).                                                                         |

### Later / optional

| Tool                                        | What it does                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Google & GitHub OAuth** (via Better Auth) | "Sign in with Google/GitHub".                                                                               |
| **Resend + React Email**                    | Sending emails (verify email, reset password).                                                              |
| **Cloudflare R2**                           | File storage for cover images and thumbnails.                                                               |
| **Inngest** or **Trigger.dev**              | Background jobs: fetching metadata, checking for broken links, large imports.                               |
| **Upstash Redis**                           | Rate limiting (stops abuse of your API).                                                                    |
| **Sentry**                                  | Error tracking in production.                                                                               |
| **PostHog**                                 | Product analytics (what features people use).                                                               |
| **Playwright**                              | End-to-end tests (a robot clicks through your app).                                                         |
| **Turborepo**                               | Faster monorepo builds. Only worth adding if builds get slow.                                               |
| **tRPC**                                    | Fully type-safe API between the frontend and backend. Worth it once you're comfortable with Route Handlers. |
| **Stripe** or **Polar**                     | Payments, if you ever add a "Pro" plan.                                                                     |

### Hosting

- **Vercel** for the web app (made by the Next.js team, free tier).
- **Neon** for the database.
- **Chrome Web Store** for the extension (one-time $5 developer fee).
- **GitHub** for the code, and **GitHub Actions** for CI (automatically runs lint and tests on every push).

---

## 2. Architecture

### The big picture

```
┌──────────────────────┐        ┌──────────────────────┐
│   Web App (browser)  │        │   Chrome Extension   │
│  React pages / UI    │        │  popup + right-click │
└──────────┬───────────┘        └──────────┬───────────┘
           │   HTTP requests (with session cookie)    │
           └──────────────────┬───────────────────────┘
                              ▼
              ┌───────────────────────────────┐
              │      Next.js server (Vercel)  │
              │  ┌─────────────────────────┐  │
              │  │ Better Auth  /api/auth  │  │  ← login, signup, sessions
              │  ├─────────────────────────┤  │
              │  │ API routes   /api/...   │  │  ← bookmarks, folders, tags
              │  │ (check session → Zod    │  │
              │  │  validate → Drizzle)    │  │
              │  └─────────────────────────┘  │
              └───────────────┬───────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │  PostgreSQL on Neon     │
                 └─────────────────────────┘
```

**Key rule:** the web app and the extension **never talk to the database directly**. They both call the same API on your Next.js server, which checks who the user is before touching the database. One backend serves both clients.

### How a request flows (example: saving a bookmark)

1. The user clicks "Save" in the extension.
2. The extension sends `POST /api/bookmarks` with `{ url, folderId }`. The browser automatically attaches the session cookie.
3. The server asks Better Auth "who is this?" and gets back user #42, or rejects with 401.
4. Zod checks that the body is valid (a real URL, folder ID present).
5. Drizzle inserts the row with `userId = 42`.
6. The server fetches the page's title and image (first in the same request, later in a background job).
7. It returns the saved bookmark. The web app shows it next time it loads.

### Folder structure (pnpm monorepo)

```
betterbookmark/
├── apps/
│   ├── web/                 # Next.js app (website + API)
│   │   ├── app/
│   │   │   ├── (auth)/      # login, signup pages
│   │   │   ├── (app)/       # dashboard, folders, settings (logged-in only)
│   │   │   └── api/
│   │   │       ├── auth/[...all]/route.ts   # Better Auth handler
│   │   │       ├── bookmarks/route.ts
│   │   │       └── collections/route.ts
│   │   ├── components/      # your components + shadcn/ui
│   │   └── lib/             # auth.ts, auth-client.ts, utils
│   └── extension/           # WXT Chrome extension
│       └── entrypoints/     # popup, background, content script
├── packages/
│   ├── db/                  # Drizzle schema, DB connection, migrations
│   └── shared/              # Zod schemas + TypeScript types used by both apps
├── pnpm-workspace.yaml
├── package.json
└── ROADMAP.md
```

**Why `packages/`?** The web app and the extension both need to know what a "Bookmark" looks like. Defining it once in `packages/shared` means both stay in sync automatically.

### Database tables (data model)

```
user ─────────┐      (created by Better Auth)
session       │      (created by Better Auth)
account       │      (created by Better Auth, stores OAuth links + password hash)
              │
              ├──< collection          (a folder)
              │      id, userId, name, parentId (→ collection, for nesting),
              │      icon, color, position, createdAt
              │
              ├──< bookmark
              │      id, userId, collectionId (→ collection, nullable = "Unsorted"),
              │      url, title, description, imageUrl, faviconUrl, note,
              │      isFavorite, position, createdAt, updatedAt
              │
              └──< tag
                     id, userId, name

bookmark_tag        (join table: many bookmarks ↔ many tags)
  bookmarkId, tagId
```

- `parentId` on `collection` is how folders nest inside folders.
- `position` stores the custom order for drag and drop.
- **Every query filters by `userId`.** This is the most important security rule in the app: users must only ever see their own data.

---

## 3. Roadmap

Each phase ends with something that **works and you can click on**. Finish one phase before starting the next. Every phase also introduces a few new tools so you're never learning ten things at once.

### Phase 0: Learn the pieces (about 1 week)

**Goal:** get comfortable before the real build.

- [ ] Do the official Next.js "Learn" course (App Router).
- [ ] Do the Drizzle "Get started with Neon" guide in a throwaway project.
- [ ] Read the Better Auth "Installation" and "Basic usage" docs.
- [ ] Learn the basics of Git branches and commits, if you haven't yet.

**New concepts:** App Router, server vs client components, ORMs, migrations.

### Phase 1: Project setup (a few days)

**Goal:** an empty app that runs and deploys.

- [x] `git init`, create a GitHub repo.
- [x] Set up the pnpm workspace (`apps/web`, `packages/shared`). `packages/db` is created in Phase 2 together with Drizzle.
- [x] `create-next-app` in `apps/web` with TypeScript + Tailwind.
- [x] `shadcn init`, add a few components (button, input, card).
- [x] Set up Oxlint (linting) + Prettier (formatting). Skip ESLint when `create-next-app` asks which linter to use.
- [x] Create a Neon project, put `DATABASE_URL` in `apps/web/.env.local`.
- [ ] Deploy to Vercel (yes, already now, so deploying is never scary).

**Done when:** a "Hello BetterBookmark" page is live on a Vercel URL.

### Phase 2: Authentication (about 1 week)

**Goal:** users can sign up, log in and log out.

- [x] Install Better Auth and connect it to Drizzle + Neon.
- [x] Generate the auth tables, run the migration.
- [x] Build signup and login pages (React Hook Form + Zod + shadcn).
- [x] Protect `(app)` pages: redirect to login if not signed in.
- [x] Add a user menu with log out.
- [x] Add dark mode (next-themes) and toasts (sonner).

**Done when:** you can create an account, log in, refresh the page and still be logged in, then log out.
**Connection to what you know:** this is your old bcrypt + cookie flow, handled by the library.

### Phase 3: Bookmarks CRUD (1–2 weeks)

**Goal:** the core feature.

- [ ] Add a `bookmark` table to the Drizzle schema and run the migration.
- [ ] API routes: create, list, update, delete bookmarks (always filtered by `userId`).
- [ ] "Add bookmark" dialog: paste a URL → save.
- [ ] Auto-fetch title, description, image and favicon (open-graph-scraper).
- [ ] Bookmark list/grid view with cards.
- [ ] Edit and delete bookmarks.
- [ ] Add TanStack Query for fetching + optimistic updates.

**Done when:** you can paste a link, see a nice card with an image, edit it and delete it.

### Phase 4: Folders (collections) (1–2 weeks)

**Goal:** organize bookmarks.

- [ ] Add a `collection` table (with `parentId` for nesting).
- [ ] Sidebar showing the folder tree.
- [ ] Create, rename and delete folders (decide what happens to bookmarks inside a deleted folder).
- [ ] Move bookmarks between folders.
- [ ] Drag and drop with dnd-kit (into folders, reorder).
- [ ] An "Unsorted" view for bookmarks with no folder.

**Done when:** you have nested folders and can drag bookmarks into them.

### Phase 5: Tags, search & sorting (1–2 weeks)

**Goal:** finding things quickly. This is what makes it "better than Chrome".

- [ ] `tag` + `bookmark_tag` tables; add and remove tags on bookmarks.
- [ ] Sort by newest, oldest, A–Z, or custom order.
- [ ] Filter by tag and favorites.
- [ ] Search with Postgres full-text search (title, description, URL, note).
- [ ] Keep filters and sort in the URL (nuqs).
- [ ] ⌘K command palette (cmdk) to jump to any bookmark or folder.

**Done when:** with 200+ bookmarks you can find any one in a few seconds.

### Phase 6: Chrome extension (2 weeks)

**Goal:** save pages without leaving the page.

- [ ] Create `apps/extension` with WXT (React template).
- [ ] Popup: shows the current tab's title/URL, a folder picker and a Save button.
- [ ] Share the login session with the web app (Better Auth `trustedOrigins` with the extension's ID).
- [ ] Right-click menu: "Save to BetterBookmark".
- [ ] Keyboard shortcut to save.
- [ ] "Save all open tabs" button.

**Done when:** logged in on the website, you click the extension icon on any page and the bookmark appears in the web app.

### Phase 7: Import & export (1 week)

**Goal:** let people move their existing bookmarks in.

- [ ] Import Chrome's exported bookmarks HTML file (keeps the folder structure).
- [ ] Import directly from Chrome through the extension (`chrome.bookmarks` API).
- [ ] Export to HTML and JSON.

**Done when:** you can import your real Chrome bookmarks with their folders intact.

### Phase 8: Polish & launch (ongoing)

- [ ] Google + GitHub OAuth login.
- [ ] Email verification + password reset (Resend).
- [ ] Empty states, loading skeletons, error pages, mobile layout.
- [ ] Sentry for errors, PostHog for analytics.
- [ ] Rate limiting (Upstash).
- [ ] Vitest unit tests for the API and Playwright for key flows.
- [ ] GitHub Actions CI.
- [ ] Publish the extension to the Chrome Web Store.

### Future ideas (after launch)

- Broken-link checker (background job).
- Page screenshots / full-page previews.
- Shared or public collections.
- Highlights and notes on pages.
- Duplicate detection.
- A paid "Pro" plan (Stripe/Polar).

---

## 4. Open questions to discuss

- Grid vs list vs both for the bookmark view?
- Can bookmarks be in **one** folder only (like Raindrop), with tags for cross-cutting groups? (Recommended, and it's what the data model above assumes.)
- What happens to bookmarks when their folder is deleted: delete them, or move them to Unsorted?
- Should the app work offline / install as a PWA?
- Free only, or a paid plan eventually?
