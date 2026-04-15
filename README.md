# 🅿️ ParkSpot — Frontend UI

A modern parking marketplace UI built with **Next.js 14**, **TypeScript**, and **Framer Motion**.

---

## ⚡ Prerequisites

Make sure you have these installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18.x | https://nodejs.org |
| npm | ≥ 9.x | Comes with Node |
| Git | any | https://git-scm.com |

Check your versions:
```bash
node -v   # should print v18+
npm -v    # should print 9+
```

---

## 🚀 Quick Start

### 1. Clone / enter the project

```bash
cd parkspot
```

### 2. Install dependencies

```bash
npm install
```

This installs:
- `next` — App Router framework
- `react` + `react-dom` — UI library
- `framer-motion` — animations
- `lucide-react` — icons
- `clsx` — conditional class names
- TypeScript + ESLint config

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys (Google Maps, Razorpay).  
The app runs fine with dummy data even without real keys.

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:3000** — it auto-redirects to `/search-parking`.

---

## 📁 Folder Structure

```
parkspot/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (Navbar + global styles)
│   │   ├── globals.css             # Design tokens, animations, base styles
│   │   ├── page.tsx                # Root → redirects to /search-parking
│   │   │
│   │   ├── login/
│   │   │   ├── page.tsx            # /login
│   │   │   └── login.module.css
│   │   │
│   │   ├── register/
│   │   │   ├── page.tsx            # /register
│   │   │   └── register.module.css
│   │   │
│   │   ├── search-parking/
│   │   │   ├── page.tsx            # /search-parking
│   │   │   └── search.module.css
│   │   │
│   │   ├── parking/[id]/
│   │   │   ├── page.tsx            # /parking/:id (spot detail + booking)
│   │   │   └── detail.module.css
│   │   │
│   │   ├── bookings/
│   │   │   ├── page.tsx            # /bookings (user booking history)
│   │   │   └── bookings.module.css
│   │   │
│   │   ├── owner/dashboard/
│   │   │   ├── page.tsx            # /owner/dashboard
│   │   │   └── dashboard.module.css
│   │   │
│   │   └── add-parking/
│   │       ├── page.tsx            # /add-parking (multi-step form)
│   │       └── add-parking.module.css
│   │
│   ├── components/
│   │   ├── Navbar.tsx              # Sticky nav with mobile drawer
│   │   ├── Navbar.module.css
│   │   ├── SpotCard.tsx            # Reusable parking spot card
│   │   ├── SpotCard.module.css
│   │   ├── StatusBadge.tsx         # Booking status pill (confirmed/pending/etc.)
│   │   └── ...
│   │
│   └── lib/
│       └── data.ts                 # Types + all dummy data
│
├── public/                         # Static assets
├── .env.example                    # Environment variable template
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#08090e` |
| Card | `#13141d` |
| Accent (green) | `#00e5a0` |
| Font (headings) | Syne |
| Font (body) | DM Sans |
| Border radius | 10px / 16px / 22px |

All tokens are CSS variables in `globals.css`.

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/login` | Email + password login |
| `/register` | Sign up with role selector (user / owner) |
| `/search-parking` | Search + filter spot grid |
| `/parking/[id]` | Spot detail with live booking card |
| `/bookings` | User booking history with status filters |
| `/owner/dashboard` | Stats + spot toggles + incoming bookings |
| `/add-parking` | Multi-step form to list a new spot |

---

## 🔌 Connecting the Backend

All API calls will go to `NEXT_PUBLIC_API_URL` (set in `.env.local`).

Replace the dummy data imports in each page with `fetch` calls:

```ts
// Before (dummy data)
import { PARKING_SPOTS } from '@/lib/data'

// After (real API)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parking`)
const spots = await res.json()
```

---

## 🛠 Useful Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
```

---

## 📦 Next Steps

1. Build the Express backend (`/api` routes)
2. Add JWT auth context (`useAuth` hook)
3. Integrate Razorpay checkout on the detail page
4. Add Google Maps on the search + detail pages
5. Connect PostgreSQL via the backend API
