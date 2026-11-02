# Pre-Trade Checklist

A minimalist Persian/English PWA (Next.js, TypeScript) for running a pre-trade checklist and logging each finished trade to **Google Sheets**. Nothing is stored in the app: trades go straight to your sheet.

## What it does

| Field | Options |
| --- | --- |
| Date | Gregorian picker, defaults to today |
| Time | 24h time + UTC offset selector, defaults to **UTC+3 (Istanbul)**; shows the UTC equivalent |
| Symbol | Gold (`XAUUSD`), Dow Jones (`US30USD`) |
| Setup | `SP2L`, `Pro BTB`, `MicroMap` → shows that setup's checklist in its own card |
| Session | Tokyo, London, New York |
| Time Window | 10–13, 13–15:30, 15:30–16:30, 16:30–18, 18–21, 21–23 |
| Cycle | Spike, Channel, Trading Range |
| Direction | Buy, Sell |
| Outcome | TP (1–3 entries, each an R multiple) or SL |
| Notes | optional — every other field is mandatory |

Each setup is written to its **own sheet tab** (`SP2L`, `Pro BTB`, `MicroMap`). Tabs and header rows are created automatically on the first trade; the checklist items become ✓/✗ columns.

## Google Sheets setup

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project and enable **Google Sheets API**.
2. *IAM & Admin → Service Accounts* → create one → *Keys → Add key → JSON*.
3. Create a Google Sheet and **share it (Editor)** with the service account's email.
4. Copy `.env.example` to `.env.local` and fill in:
   - `GOOGLE_SHEET_ID` — from the sheet URL (`/d/<id>/edit`)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — `client_email` from the JSON
   - `GOOGLE_PRIVATE_KEY` — `private_key` from the JSON (keep the `\n`, wrap in quotes)

On Vercel, add the same three variables under *Project → Settings → Environment Variables*.

> The API route is public to anyone who knows the URL. Keep the deployment URL private (or enable your host's password protection).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (time, validation, sheet rows, Sheets calls)
npm run typecheck
npm run build && npm start   # production build (registers the service worker)
```

## Project structure

```
src/
  app/                 layout, page, manifest, api/trades route
  components/
    ui/                Card, Field, ChoiceGroup, Calendar, Toast, SubmitBar, OfflineBanner
    fields/            DateField, TimeField, UtcOffsetField, TpEntries, NotesField
    checklist/         SetupChecklist
    trade-form/        TradeForm (composes everything)
    pwa/               ServiceWorkerRegister
  config/              options.ts (all choices), checklists.ts (per-setup items)
  hooks/               useTradeForm (state, validation, submit), useOnlineStatus
  lib/                 time, number, validation, schema (zod, server), sheets/
public/                sw.js, icons/
```

Customising: edit `src/config/options.ts` (choices) or `src/config/checklists.ts` (checklist items). Don't reorder checklist items after you've started logging — sheet headers are written once, on an empty tab.

`REQUIRE_FULL_CHECKLIST` in `options.ts` (default `false`) makes the app refuse to submit until every checklist item is ticked.

## PWA

Installable (manifest + icons) and the app shell loads offline. Submitting a trade requires a connection; failed submissions keep the form so you can retry.
