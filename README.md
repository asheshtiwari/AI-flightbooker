# AI‑FlightBooker

**[Live Demo](https://ai-flightbooker.vercel.app/) | [Report Bug](https://github.com/asheshtiwari/AI-flightbooker/issues) | [Request Feature](https://github.com/asheshtiwari/AI-flightbooker/issues) | [Live API (Backend)](https://ai-flightbooker.onrender.com/)**

## Overview

AI‑FlightBooker is a production‑ready, full‑stack flight booking engine built to handle real operational edge cases. It combines a defensive backend, a responsive Vite + React frontend, and a context‑aware RAG AI concierge. The project emphasizes atomic transactions, isolated pricing logic, memory‑safe PDF streaming, and CI‑backed quality gates so the code is safe to demo to senior engineers and recruiters.

## Tech Stack

* **Frontend:** React (Vite), Context API, Axios (interceptors), Vanilla CSS
* **Backend:** Node.js, Express, MongoDB (Mongoose)
* **AI:** Cohere command-a-03-2025 via a custom RAG pipeline
* **Utilities:** pdfkit, bcryptjs, jsonwebtoken
* **DevOps & Testing:** GitHub Actions, Node assert / Jest, Winston logging

## Key Features

### Dynamic Pricing
1.  **Compounding surge:** After 3 searches for the same route, fares apply a compounding 10% multiplier using `Math.pow(1.10, n)` for extra searches.
2.  **Safety cap:** Surge is strictly capped at 50% of the base fare (`baseFare * 1.50`) to prevent runaway inflation.
3.  **Calculation isolation:** Backend computes base fare and surge separately and renders the breakdown on invoices so the frontend cannot tamper with pricing.
4.  **Test‑driven verification:** Pricing logic and edge cases (zero‑values, thresholds) are independently verified before execution via a custom Node.js assert test suite (`pricing.test.js`).

### Wallet & Transactions
1.  **Stateless JWT auth:** Uses `expiresIn: '7d'` and Axios interceptors for automatic token injection.
2.  **Atomic updates:** Wallet operations use MongoDB atomic operators (`$inc`, `$set`) to avoid race conditions and negative balances.
3.  **Synchronous checkout:** Balance validation, seat inventory decrement, and booking writes are executed as a tightly coupled operation to maintain ledger consistency.
4. **Instant Cancellation & Auto-Refunds:**Built a seamless one-click cancellation flow that automatically frees up the flight seat and instantly credits the refund back to the user's wallet.

### AI Concierge (RAG)
1.  **Context injection:** `/api/ai/chat` injects the authenticated user’s wallet balance and last five bookings (optimized via `.lean()`) into the LLM prompt.
2.  **Domain guardrails:** System prompts constrain the model to aviation, ticketing, and wallet tasks only.
3.  **Graceful degradation:** If the LLM fails or times out, the API returns a structured offline response to avoid frontend crashes.
4.  **Payload sanitization:** Incoming messages are trimmed and validated server‑side to avoid empty requests and unnecessary token usage.
5. **Context-Aware AI Support:** Upgraded the AI RAG pipeline to dynamically read the database state, allowing the AI assistant to provide users with real-time, human-like updates regarding their cancelled tickets and wallet refund statuses.

### PDF Streaming
1.  **Memory‑optimized:** Tickets are generated with `pdfkit` and streamed directly to the client via `doc.pipe(res)`, avoiding server disk writes.

### Search & Discovery
1.  **JIT seeding:** If a route has no flights, the service seeds mock flights with `insertMany` to avoid empty search results.
2.  **Fuzzy matching:** Search uses case‑insensitive regex to tolerate input variations.

### Security & Multi‑tenant Isolation
1.  **IDOR protection:** All resource queries enforce ownership checks, e.g., `findOne({ ticketNumber, userRef: req.user._id })`.
2.  **Response sanitization:** Controllers filter out sensitive fields such as hashed passwords before returning user objects.

## Frontend, API Security and Developer Ergonomics

1.  **Pre‑emptive interceptors:** Axios security layer is initialized in `index.jsx` before React component mounting to prevent token race conditions on initial load. This prevents early dashboard requests from failing during session restoration and is a deliberate frontend optimization to avoid transient 401/race issues.
2.  **Optimistic UI & rollback:** Wallet and booking flows use optimistic updates with deterministic rollback and background reconciliation to keep the UX snappy while preserving correctness.
3.  **Build & runtime notes:** Frontend env vars must be prefixed with `VITE_` (e.g., `VITE_API_BASE_URL`) so they are available at build time. Ensure CORS on the backend allows the deployed frontend origin.

## CI/CD & DevOps

1.  **Automated quality gates:** A GitHub Actions workflow (`ci.yml`) automatically provisions an Ubuntu environment to run `npm ci` and Jest tests on every push, ensuring broken code never reaches the main branch.
2.  **Deterministic installs:** CI uses `npm ci` to lock dependency trees and avoid build drift.
3.  **Safe seeding:** `seed.js` refuses to run when `NODE_ENV === 'production'` to prevent accidental data wipes.
4.  **Logging & observability:** Use Winston for structured production logs; keep sensitive data out of logs and use environment secrets in CI.

## Local Setup, Deployment Checklist & Env Vars

### Quick Local Start

```bash
git clone https://github.com/asheshtiwari/AI-flightbooker.git
cd AI-flightbooker
```
### Backend Setup

```Bash
cd backend
cp .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET, COHERE_API_KEY, PORT
npm ci
# seed.js refuses to run in production
node seed.js
npm start
```

### Frontend Setup

```Bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:5000/api
npm ci
npm run dev
```
### Run Tests
```Bash
cd backend
npm test
```