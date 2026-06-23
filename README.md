# Product Recommendation System

A React app that displays a product catalog and uses AI to recommend items based on natural-language preferences (e.g. "I want a phone under $500").

## Features

- Product catalog with phones, laptops, headphones, tablets, and watches
- Natural-language preference input with example prompts
- Anthropic-powered recommendations via a secure backend
- Local fallback matching when AI is unavailable
- Highlighted recommended products in the full catalog

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express + Anthropic API
- **AI:** Claude (Anthropic) with structured JSON output

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Anthropic API key:

```bash
cp .env.example .env
```

3. Start the app (frontend + API on one port):

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. The user enters preferences in plain English.
2. The frontend sends the request to `/api/recommend`.
3. The backend passes the product catalog and user preferences to Claude.
4. Claude returns matching product IDs and a short explanation.
5. The frontend filters and displays the recommended products.

If the AI service fails, the app falls back to local keyword matching so users still get results.

## Deploy

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI) | Your Anthropic API key |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-haiku-4-5` |
| `PORT` | No | Defaults to `3000` (set automatically on most hosts) |
| `NODE_ENV` | Yes | Set to `production` |

### Build & start

```bash
npm install
npm run build
npm start
```

### Render

A `render.yaml` is included. Connect your repo on [Render](https://render.com), add `ANTHROPIC_API_KEY` in the dashboard, and deploy.

### Railway / Fly.io / VPS

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Health check:** `GET /api/health`

## Project Structure

```
shared/
  products.js              # Single product catalog (shared source of truth)
src/
  api/recommendations.js   # Frontend API client
  components/              # UI components
server/
  index.js                 # Express server (serves app + API)
  api.js                   # Recommendation API + Anthropic integration
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start app on http://localhost:3000 |
| `npm run build` | Build frontend for production |
| `npm run preview` | Build and run production locally |
| `npm start` | Run production server |
| `npm run stop` | Stop local dev server on port 3000 |
# Assignment-STC
