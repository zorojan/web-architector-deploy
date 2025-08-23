# Same-domain routing (frontend, admin, backend)

This repo can be deployed so that all three services appear under the same domain:

- /           -> Frontend (Vite static files)
- /admin      -> Admin panel (Next.js)
- /api        -> Backend (Express API)

Two practical options are provided below. Pick one that matches your hosting:

1) Vercel (recommended if you host frontend or admin on Vercel)
---------------------------------

- Use `vercel.json` rewrites to point /api to your backend and /admin to your Next admin app.
- Example `vercel.json` (replace placeholders):

  {
    "version": 2,
    "rewrites": [
      { "source": "/api/:path*", "destination": "https://api.example.com/api/:path*" },
      { "source": "/admin/:path*", "destination": "https://admin.example.com/:path*" }
    ]
  }

- Add environment variables in Vercel project settings:
  - For the frontend project: VITE_API_URL = https://your-domain.com/api
  - For the admin project: NEXT_PUBLIC_API_URL = https://your-domain.com/api
  - For both: set NEXT_PUBLIC_WIDGET_URL / VITE_WIDGET_URL if widgets are served from a different host.

Notes:
- Rewrites proxy requests to target domains while keeping the public URL the same.
- Ensure CORS is configured correctly on the backend (it should allow your public domain).

2) Nginx reverse proxy (self-hosted/VPS)
---------------------------------

- Use the provided `deploy/nginx-reverse-proxy.conf` as a starting point. Replace `example.com` and local ports if needed.
- Start or systemd-manage your services:
  - Frontend: serve `frontend/dist` via a static server on 5173 (or build and use nginx directly)
  - Admin: run Next.js (`next start`) on port 3000
  - Backend: run the Express server on port 3001

Example flow on a VPS:

1. Build and start backend (systemd or pm2):
   - `cd backend && npm run build && NODE_ENV=production node dist/server.js`
2. Build and start admin:
   - `cd admin-panel && npm run build && NODE_ENV=production npm run start` (or `next start`)
3. Build frontend and serve static files (or use vite preview):
   - `cd frontend && npm run build` then serve `frontend/dist` with a static server.
4. Configure nginx with `deploy/nginx-reverse-proxy.conf` and reload nginx.

Security and headers
--------------------
- Add TLS (Let's Encrypt) on nginx or use Vercel's automatic HTTPS.
- Set appropriate headers (HSTS, CSP) for production.

If you want, I can:
- Produce a complete `systemd` unit for each service.
- Create a `vercel.json` tuned to your real domains and help set Vercel env vars.
