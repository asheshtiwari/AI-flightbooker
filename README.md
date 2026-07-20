# AI-FlightBooker

<img width="1536" height="732" alt="Image" src="https://github.com/user-attachments/assets/c661638f-1482-42a1-8e5e-7214dc3e3ddc" />

<img width="1534" height="729" alt="Image" src="https://github.com/user-attachments/assets/2354329d-6bac-4eb5-add5-c857f6398fb4" />

<img width="1535" height="732" alt="Image" src="https://github.com/user-attachments/assets/27d9de2b-bc86-4f6a-9ad5-03651661273f" />

<img width="1528" height="726" alt="Image" src="https://github.com/user-attachments/assets/33dac07a-96e1-4c6f-9c3f-b81b929374e4" />

<img width="484" height="681" alt="Image" src="https://github.com/user-attachments/assets/d261859f-1e00-417b-ab0d-f1b5b9b6a70a" />

**[Live Demo](https://ai-flightbooker.vercel.app/) | [Report Bug](https://github.com/asheshtiwari/AI-flightbooker/issues) | [Live API](https://ai-flightbooker-backend.onrender.com/)**

---

I built this to actually understand how booking systems work under pressure — what happens when two users book the same seat at the same time, how surge pricing stays consistent across services, and how to make an AI assistant that knows your actual account state instead of making things up.

It's a full-stack app with a Node/Express backend, React frontend, MongoDB, and a Cohere RAG pipeline. The parts I'm most proud of are the ones that broke first and had to be fixed properly.

## Stack

- **Frontend:** React (Vite), Context API, Axios interceptors, CSS Modules
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI:** Cohere command-a-03-2025 — custom RAG pipeline
- **Libraries:** pdfkit, bcryptjs, jsonwebtoken, cors, morgan, dotenv, Winston
- **DevOps:** Docker, GitHub Actions, nodemon

## What I had to fix

**Race condition in wallet deductions** — the first version checked the balance, then deducted. Two requests arriving at the same millisecond could both pass the balance check and overdraw the account. Fixed by combining the check and deduct into one `findOneAndUpdate` with a `$gte` condition — either it finds a document with enough balance and updates it, or it returns null.

**Cancellation leaving users without refunds** — cancelling a ticket used to be three separate database calls: mark cancelled, refund wallet, restore seat. A server crash between any two meant the user lost their money silently. Wrapped all three in a MongoDB session transaction — everything commits together or nothing does.

**Surge pricing counting cancelled tickets** — when a flight had enough bookings to trigger surge, cancelled bookings were still counted. So a flight with 3 real bookings and 10 cancellations was showing surge pricing. Fixed the aggregate query to filter out `CANCELLED` status before counting.

**N+1 query on flight search** — for every flight in the search results, the code fired a separate `countDocuments` call to check booking count for surge. Ten flights meant ten DB calls. Replaced with a single `aggregate` pipeline that groups booking counts for all flights at once.

**Stale wallet balance in AI responses** — the AI was reading wallet balance from `req.user`, which comes from the JWT middleware and reflects the balance at login time. If the user recharged after logging in, the AI would tell them their old balance. Fixed by fetching fresh balance from the DB on every AI request.

**Past date bookings** — nothing was stopping users from booking flights on dates that had already passed. Added `min={today}` on the date input and a date comparison on the backend before processing any payment.

## How the AI assistant works

The chatbot isn't a simple Cohere wrapper. On every message, it fetches the user's current wallet balance from the DB and their last 5 bookings, builds a context string, and injects it into the system prompt. Domain guardrails in the prompt stop it from answering anything outside flights, bookings, and wallet. If Cohere is down or times out after 30 seconds, it returns a structured offline response instead of crashing.

## Security decisions

- JWT secret throws on startup if missing — no silent fallback to a weak default string
- Every booking and ticket query includes `userRef: req.user._id` — users can only access their own data
- Login returns the same error for wrong email and wrong password — prevents figuring out which emails are registered
- Phone stored with country code, regex-validated on both ends
- CORS locked to the deployed frontend URL via environment variable
- Passwords hashed with bcrypt, never returned in responses
- `seed.js` blocks itself from running in production

## Local setup

```bash
git clone https://github.com/asheshtiwari/AI-flightbooker.git
cd AI-flightbooker
```

**Backend:**
```bash
cd backend
cp .env.example .env
# fill in: MONGO_URI, JWT_SECRET, COHERE_API_KEY, CLIENT_URL
npm ci
node seed.js
npm start
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# fill in: VITE_API_BASE_URL
npm ci
npm run dev
```

**Tests:**
```bash
cd backend
npm test
```

## CI/CD

GitHub Actions runs `npm ci` and Jest on every push to main. `seed.js` refuses to run in production so there's no way to accidentally wipe real data on the live server.