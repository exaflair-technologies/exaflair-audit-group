# audit-exaflair
This website represents the audit details and website for the company.

## Structure

| Folder      | What                                   | Port |
|-------------|----------------------------------------|------|
| `frontend/` | Next.js app for end users              | 3000 |
| `admin/`    | Next.js admin panel (admins only)      | 3001 |
| `supabase/` | Supabase config and SQL migrations     | —    |

The two apps are independent (own `package.json`, own `node_modules`) and share only the Supabase database.

## Setup

1. Start the database (needs Docker): `npx supabase start` — prints the API URL, anon key and service-role key.
2. In each app: `cp .env.example .env.local` and fill in the values.
3. Run each app: `cd frontend && npm run dev` / `cd admin && npm run dev`.

To give someone admin access, set `profiles.role = 'admin'` for their user (Supabase Studio at http://127.0.0.1:54323).
