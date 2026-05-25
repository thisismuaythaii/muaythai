# Muay Thai — Monorepo

Full-stack monorepo for the Muay Thai platform, built with Next.js, Tailwind CSS, Framer Motion, and Turborepo.

---

## Apps

| App | Port | Description |
|---|---|---|
| `apps/web` | 3000 | Public-facing marketing site |
| `apps/dashboard` | 3001 | Admin dashboard |

## Packages

| Package | Description |
|---|---|
| `packages/ui` | Shared component library (shadcn/ui) |
| `packages/utils` | Shared constants, config, and utilities |
| `packages/config` | Shared ESLint config |

---

## Prerequisites

- **Node.js** 18+
- **pnpm** 9+

```bash
npm install -g pnpm@9
```

---

## Getting Started

```bash
# Install all dependencies
pnpm install

# Start all apps in dev mode
pnpm dev
```

---

## Commands

### Monorepo root

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps via Turbo |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps and packages |
| `pnpm type-check` | TypeScript check across all apps |

### Web app only (`apps/web` · localhost:3000)

| Command | Description |
|---|---|
| `pnpm --filter web dev` | Start dev server |
| `pnpm --filter web build` | Production build |
| `pnpm --filter web start` | Start production server |

### Dashboard only (`apps/dashboard` · localhost:3001)

| Command | Description |
|---|---|
| `pnpm --filter dashboard dev` | Start dev server |
| `pnpm --filter dashboard build` | Production build |
| `pnpm --filter dashboard start` | Start production server |

---

## Project Structure

```
.
├── apps/
│   ├── web/                  # Marketing site (Next.js 14)
│   │   ├── src/
│   │   │   ├── app/          # App router (layout, page)
│   │   │   ├── components/   # Page sections and UI
│   │   │   ├── assets/       # Images (jpg, png)
│   │   │   └── hooks/        # Custom React hooks
│   │   └── public/           # Static files
│   └── dashboard/            # Admin dashboard (Next.js 14)
├── packages/
│   ├── ui/                   # Shared components
│   ├── utils/                # Shared config and constants
│   └── config/               # Shared ESLint config
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Required Assets

Place these images in `apps/web/src/assets/` before building:

| File | Used in |
|---|---|
| `hero-group.jpg` | Hero section background |
| `training.jpg` | About section |
| `phuket.jpg` | Locations — Phuket |
| `bangkok.jpg` | Locations — Bangkok |
| `chiangmai.jpg` | Locations — Chiang Mai |
| `krabi.jpg` | Locations — Krabi |
| `kohsamui.jpg` | Locations — Koh Samui |
| `logo.png` | Intro animation and navbar |
