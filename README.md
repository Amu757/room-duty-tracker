# 🏠 Room Duty Tracker (MERN)

MongoDB + Express + React (Vite) + Node. Tracks daily room duties, covers, fines and weekly scores.

## Requirements
- Node.js 18+
- MongoDB running locally **or** a free MongoDB Atlas connection string

## Setup (first time)
```bash
npm run install-all
```
Open `server/.env` and set `MONGO_URI` if you are not using local MongoDB
(a default `.env` for local MongoDB is already included).

## Run in development
```bash
npm run dev
```
- React app: http://localhost:5173
- API:       http://localhost:5000/api

## Run as a single app (production style)
```bash
npm run build
npm start
```
Open http://localhost:5000 — Express serves the built React app.
Other phones on the same Wi‑Fi can open `http://<your-laptop-ip>:5000`.

## Project structure
```
server/   Express API + Mongoose models (Chart, Log)
client/   React UI (Today, Chart, Ledger, Review tabs)
```

## API
| Method | Route | Purpose |
|---|---|---|
| GET/PUT | /api/chart | weekly duty chart |
| GET | /api/logs | all records |
| PUT | /api/logs | save result for a duty |
| PATCH | /api/logs/:date/:duty/settle | toggle settled/paid |
| DELETE | /api/logs/:date/:duty | undo |
| DELETE | /api/logs | clear all |
| GET / POST | /api/backup, /api/restore | backup & restore |

Rules (unchanged from your original): fine ₹10 for a missed duty without notice; a told absence that someone covers is a credit, not a fine.
"# room-duty-tracker" 
