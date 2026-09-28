# Durianpay Payments Dashboard

A full-stack internal dashboard for monitoring incoming payments. Built with a **Go** backend (using the provided boilerplate) and a **React + TypeScript** frontend.

The dashboard lets internal teams sign in, view a live list of payments, filter by status, and see summary statistics — all backed by a RESTful API defined in [`openapi.yaml`](./openapi.yaml).

---

## ✨ Features

- **Authentication** — JWT-based login with role (`cs` / `operation`).
- **Payments list** — table of payments (Payment ID, Merchant Name, Date, Amount, Status).
- **Status filter** — filter by `completed`, `processing`, or `failed`.
- **Pagination** — server-side pagination (10 per page) with prev/next controls.
- **Summary widget** — total payments, status breakdown, and total volume.
- **Protected routes** — the dashboard is only accessible after login.
- **OpenAPI integration** — the frontend consumes a typed client generated from `openapi.yaml`.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go (boilerplate), SQLite, JWT, chi HTTP server |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | TanStack Query (server state), Zustand (auth/session) |
| API | RESTful, OpenAPI v3 (`openapi.yaml`) |
| Testing | Go stdlib tests, Vitest + React Testing Library |

---

## 📋 Prerequisites

The reviewer environment is a **Mac** with:

- **Go v1.24+** (the dependency tree requires 1.24; the brief's "Go v1.21+" is satisfied)
- **Node v20+** (tested with v26)
- **Docker & Docker Compose** (optional — for the containerized path)
- **Make**

Verify your tools:

```bash
go version   # go1.24.0 or newer
node --version  # v20 or newer
npm --version
make --version
```

> **Note on Node:** if you use `nvm`, select a modern version first, e.g. `nvm use 26`.

---

## 🚀 Quick Start (Docker — recommended)

The fastest way to run the whole stack:

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

---

## 🚀 Quick Start (Local — no Docker)

### 1. Backend

```bash
cd backend
cp env.sample .env
make dep          # install Go dependencies
make gen-secret   # generate a JWT_SECRET into .env
make run          # starts the API on :8080
```

The backend seeds a SQLite database (`dashboard.db`) on first run with:

- Two users: `cs@test.com` and `operation@test.com` (password `password`)
- 50 sample payments across all statuses

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev       # starts the dev server on :5173
```

Open http://localhost:5173 and sign in with `cs@test.com` / `password`.

> The Vite dev server proxies `/dashboard/v1/*` to the backend on `:8080`, so no CORS configuration is needed in development.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Customer Service | `cs@test.com` | `password` |
| Operations | `operation@test.com` | `password` |

---

## 🧪 Running Tests

### Backend

```bash
cd backend
go test ./...
```

### Frontend

```bash
cd frontend
npm test
```

---

## 🛠️ Linting & Formatting

### Backend

```bash
cd backend
go vet ./...   # static analysis
gofmt -l .     # check formatting (empty output = clean)
```

### Frontend

```bash
cd frontend
npm run lint
npm run format
```

---

## 📦 Production Build

### Backend

```bash
cd backend
make build      # outputs ./bin/mygolangapp
```

### Frontend

```bash
cd frontend
npm run build   # outputs ./dist
```

---

## 🔌 API Reference

The API is defined in [`openapi.yaml`](./openapi.yaml) (OpenAPI v3). The frontend's typed client is generated from it via `openapi-typescript`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/dashboard/v1/auth/login` | — | Login with email + password, returns JWT + role |
| `GET` | `/dashboard/v1/payments` | Bearer | List payments (paginated) |
| `GET` | `/dashboard/v1/payments?status=<status>` | Bearer | Filter by status (`completed`/`processing`/`failed`) |
| `GET` | `/dashboard/v1/payments?sort=<field>` | Bearer | Sort (prefix `-` for descending) |
| `GET` | `/dashboard/v1/payments?page=<n>&limit=<n>` | Bearer | Paginate (default `page=1`, `limit=10`) |

The payments response includes pagination metadata:

```json
{
  "payments": [ ... ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

### Example: Login

```bash
curl -X POST http://localhost:8080/dashboard/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"cs@test.com","password":"password"}'
```

### Example: List payments (page 2)

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/dashboard/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"cs@test.com","password":"password"}' | jq -r .token)

curl "http://localhost:8080/dashboard/v1/payments?page=2&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧭 Project Structure

```
.
├── README.md            # this file
├── Makefile             # root convenience targets
├── docker-compose.yml   # containerized backend + frontend
├── openapi.yaml         # API spec (source of truth)
├── backend/             # Go API
│   ├── main.go          # entrypoint, migrations, seed
│   └── internal/
│       ├── api/         # API handler wiring
│       ├── middleware/  # JWT auth
│       ├── module/      # auth + payments (handler/usecase/repository)
│       ├── service/     # HTTP server
│       └── transport/   # error responses
└── frontend/            # React + TS dashboard
    └── src/
        ├── api/         # generated OpenAPI client + fetch wrapper
        ├── components/  # PaymentsTable, SummaryWidget, StatusBadge...
        ├── pages/       # LoginPage, DashboardPage
        ├── router/      # routes + ProtectedRoute
        ├── store/       # Zustand auth store
        └── utils/       # formatting + summary helpers
```

---

## 🧪 Testing Strategy

**Backend** — unit tests for the critical business logic:
- `auth/usecase` — login success (JWT generation/verification), wrong password, user not found.
- `payments/usecase` — status validation and filtering.
- `middleware` — JWT auth: missing/invalid/valid/wrong-secret tokens.

**Frontend** — component and unit tests with Vitest + React Testing Library:
- `LoginPage` — form rendering and validation.
- `ProtectedRoute` — redirect vs. render based on auth state.
- `auth` store — login/logout state transitions and persistence.
- `PaymentsTable`, `StatusBadge`, `StatusFilterBar` — rendering and interactions.
- `summary` / `format` — pure logic.

The frontend tests mock the API and auth store so they run fast and deterministically without a live backend.

---

## ⚠️ Notes for Reviewers

- **Go version:** the backend requires **Go 1.24+** (the boilerplate's dependency tree — e.g. `golang.org/x/sync`, `x/text` — has a hard minimum of 1.24). This satisfies the brief's "Go v1.21+".
- **Node version:** use **Node 20+** (tested with v26).
- **Data seed:** the backend auto-creates `dashboard.db` with users and 50 payments on first run. Delete `backend/dashboard.db` to re-seed.
- **JWT secret:** `make gen-secret` writes a fresh secret into `backend/.env`. For local dev, the default in `env.sample` works too.
