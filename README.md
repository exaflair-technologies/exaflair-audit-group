# audit-exaflair
This website represents the audit details and website for the company.

## Structure

| Folder      | What                      | Port |
|-------------|---------------------------|------|
| `frontend/` | Next.js app for end users | 3000 |

Audits and partner logos are hardcoded in `frontend/src/data/audits.ts` and `frontend/src/data/partners.ts`.
Put report PDFs and logos under `frontend/public/` and reference them by path.

## Setup

`cd frontend && npm install && npm run dev`
