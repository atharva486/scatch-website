# Deployment status and guide

Last verified: **2 October 2026**

This document records what is actually live right now, what is broken, and the
exact steps to finish the deployment. It was written by inspecting the live
servers, not by reading config, so the status below is measured rather than
assumed.

---

## TL;DR

| Piece | Status | Notes |
|---|---|---|
| GitHub repo | **Live** | `github.com/atharva486/scatch-website`, commit `90f6e1b` |
| Vercel (frontend) | **Deployed, working** | New build live, deep links fixed |
| Render (backend) | **Deploy fails** | `MONGODB_URI` still points at the deleted Atlas cluster |
| MongoDB | **Gone** | `scatch-prod.ciaaonh.mongodb.net` is NXDOMAIN. Needs a new cluster. |
| Cloudinary images | **Working** | Account `dunxugggm` is live, all seed images return 200 |

**Fix in order:** create a new Atlas cluster → set `MONGODB_URI` on Render →
redeploy → seed. Full instructions in [ATLAS_SETUP.md](./ATLAS_SETUP.md).

⚠️ A failing deploy is **not** the same as an unreachable database, but they
look identical from the API. Requests to the old backend return `{"success":false}`
in ~0.3s because DNS fails immediately and the old controller's `catch` block
swallows the error. That fast failure reads like a healthy empty database. It
is not one — there is no database at all. See "Database" below.

---

## What is live right now

### Frontend — deployed, new code

`https://scatch-website.vercel.app` is serving the current build. Verified by
matching the served asset hashes against a local `vite build`:

```
/assets/index-MAteYdR4.js
/assets/react-CDinKP3e.js
/assets/motion-D21cyCpL.js
/assets/charts-3oTiNNhX.js   (charts-3oTiSNhX.js)
/assets/index-BCvKf0dO.css
```

Vercel rebuilt automatically when the branch was pushed. The page title
(`Scatch - Car Parts Marketplace`) and `favicon.svg` are the new ones.

Environment variables baked into the deployed bundle:

| Variable | Value in production | Source |
|---|---|---|
| `VITE_API_URL` | `https://scatch-website.onrender.com` | Vercel dashboard (not the repo) |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dunxugggm` | fallback default in `client/src/utils/image.js` |

Both `VITE_*` values come from Vercel's dashboard, **not** from the repository,
because `client/.env` is gitignored. That is correct and intended, but it means
the dashboard is the only place they are defined — see the caveat below.

### Backend — still on the old code

`https://scatch-website.onrender.com` is alive and serving, but it has **not**
been redeployed since the fixes were pushed. Proof:

```
# deployed backend, unknown route under /api:
$ curl -X POST .../api/definitely-not-a-route
Cannot POST /api/definitely-not-a-route        <- Express default HTML

# current local backend, same request:
$ curl -X POST localhost:3000/api/definitely-not-a-route
{"success":false,"error":"Endpoint not found"} <- new JSON 404 handler
```

Two routes that exist only in the new code are missing in production:

| Route | Deployed | Local |
|---|---|---|
| `GET /api/health` | 404 | 200 |
| `GET /api/session` | 404 | 200 |

So the old code is live: its `POST /api/user/login` returns
`{"success":false}` with HTTP 200, which is the old handler's response shape.
The new code returns HTTP 401.

### Database — does not exist

`MONGODB_URI` on Render still points at the original Atlas cluster, which was
deleted. The hostname does not resolve:

```
$ host scatch-prod.ciaaonh.mongodb.net
Host scatch-prod.ciaaonh.mongodb.net not found: 3(NXDOMAIN)
```

Because DNS fails in ~0.3s and the old controllers wrap every query in a
`catch` that returns `{"success":false}`, the API *appears* to be working. Every
call looks like "no data" rather than "no database". This is why login, the
products listing and registration all return `{"success":false}` with HTTP 200.

To fix: create a new cluster and update the variable. See
[ATLAS_SETUP.md](./ATLAS_SETUP.md).

The new server code makes this failure obvious instead of silent — it refuses to
boot in production without `MONGODB_URI`, and `/api/health` reports the database
state, so this specific class of problem cannot recur unnoticed.

### Images — working

Cloudinary account `dunxugggm` is live. All four seed images return HTTP 200
with real bytes:

| Public ID | Status | Size |
|---|---|---|
| `samples/ecommerce/analog-classic` | 200 | 72 KB |
| `samples/ecommerce/shoes` | 200 | 393 KB |
| `samples/ecommerce/car-interior-design` | 200 | 1.2 MB |
| `samples/ecommerce/leather-bag-gray` | 200 | 1.3 MB |

**Note:** these only resolve with the full public ID *including* the
`samples/ecommerce/` folder prefix. Requesting just `analog-classic` returns
404. This is normal Cloudinary behaviour, not a misconfiguration. Seed data
stores the full path, so it is correct — but it is worth knowing if images ever
appear broken, because a partial id fails silently and the UI falls back to the
grey "No image" placeholder.

If an image does fail, `ProductImage` renders the placeholder rather than a
broken-image icon, so a 404 is easy to miss. Check the Network tab.

---

## Blocker 1 — Vercel has no SPA rewrite

`BrowserRouter` means the client owns routing, so the server must return
`index.html` for any unknown path. Without that rewrite, every deep link 404s:

```
/                            -> 200
/user/login                  -> 404
/user/homepage               -> 404
/seller/login                -> 404
/user/order_details/abc123   -> 404
```

The body is Vercel's `NOT_FOUND` page, not the app. Practically: the site works
if you land on the root URL and click through, and breaks on **any refresh,
bookmark, shared link, or direct navigation**. Because the order detail page
reads its id from the URL, that one is affected too.

**Status: fixed and verified live.** `vercel.json` now contains the rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

It is committed at both the repository root and `client/`, because Vercel only
reads the config from whichever directory is set as the project's **Root
Directory**, and that setting is not visible from the code. Whichever one Vercel
reads, the rewrite applies. Once the deployment is confirmed working, delete
whichever of the two is not being used.

Re-verified after deploy — every path now returns 200 and serves the SPA shell:

```
/                            -> 200
/user/login                  -> 200
/user/homepage               -> 200
/user/order_details/abc123   -> 200
/seller/dashboard            -> 200
/totally-bogus               -> 200   (renders the app's NotFound page)
```

---

## Blocker 2 — Render deploys fail on the database

**This needs dashboard access.** The deploy fails at startup because
`MONGODB_URI` references a deleted cluster. Full walkthrough, including the
Atlas console steps, is in [ATLAS_SETUP.md](./ATLAS_SETUP.md).

Short version:

1. Create a free M0 cluster at <https://cloud.mongodb.com>.
2. Add a database user with **Read and write to any database**.
3. Network Access → add `0.0.0.0/0` (Render has no fixed outbound IP).
4. Connect → Drivers → Node.js → copy the connection string.
5. Render → Environment → set `MONGODB_URI` to it → Save.
6. Manual Deploy → Deploy latest commit.
7. Verify `/api/health` returns 200, then seed the data.

### Environment variables to check on Render

The server refuses to start in production without `MONGODB_URI` — that is
deliberate, so a missing database fails loudly instead of silently serving an
empty in-memory store.

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | **yes** | Must be set. An empty value makes the server exit. |
| `JWT_KEY` | **yes** | Long random string. Rotating it logs everyone out. |
| `JWT_EXPIRES_IN` | no | e.g. `7d` |
| `CLIENT_URL` | **yes in production** | `https://scatch-website.vercel.app`. Must include the scheme, and no trailing slash. |
| `CLOUDINARY_CLOUD_NAME` | yes if sellers upload | `dunxugggm` |
| `CLOUDINARY_API_KEY` | yes if sellers upload | from the Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | yes if sellers upload | from the Cloudinary dashboard |

`CLIENT_URL` matters more than it looks. The app authenticates with an
`httpOnly` cookie, and the cookie is only first-party when the browser sees one
origin. In production the frontend is on Vercel and the API on Render, so that
request *is* cross-site and CORS decides whether it works. If `CLIENT_URL` does
not list the Vercel origin exactly, every API call fails and the client reports
the misleading message **"Cannot reach the server"** — even though the server is
up and healthy.

---

## Blocker 3 — the database is empty

Even after Render redeploys, the app will be unusable: there are no accounts.
Registration works, so the quickest path is to sign up through the UI. To get
demo data instead:

```bash
# from the repo, with server/.env pointed at the real cluster
cd server
npm run seed
```

This creates 2 sellers, 2 customers, 6 products and ~24 orders spread over 6
months, so the seller analytics charts have something to draw. All demo accounts
use the password `Password123`:

| Role | Email |
|---|---|
| Customer | `user@scatch.dev`, `user2@scatch.dev` |
| Seller | `seller@scatch.dev`, `seller2@scatch.dev` |

Sellers and customers are **separate account types**. A seller account cannot
log in at `/user/login`, and vice versa — logging in with the wrong form returns
`{"success":false}` with no explanation, which is easy to mistake for a wrong
password.

> Only run the seed against a database you are happy to overwrite. It is meant
> for a fresh demo cluster, not production data.

---

## Verifying a deployment

Run these four checks. All four must pass.

```bash
# 1. backend is the new code
curl -i https://scatch-website.onrender.com/api/health
#    expect 200

# 2. backend returns JSON, not Express HTML
curl -X POST -H 'Content-Type: application/json' -d '{}' \
  https://scatch-website.onrender.com/api/definitely-not-a-route
#    expect {"success":false,"error":"Endpoint not found"}

# 3. deep links resolve to the SPA (not Vercel's 404 page)
for p in / /user/login /user/homepage /seller/login /user/order_details/abc; do
  printf "%-28s %s\n" "$p" \
    "$(curl -s -o /dev/null -w '%{http_code}' https://scatch-website.vercel.app$p)"
done
#    expect 200 for every path

# 4. images are reachable
curl -o /dev/null -w '%{http_code}\n' \
  https://res.cloudinary.com/dunxugggm/image/upload/samples/ecommerce/shoes
#    expect 200
```

Then in a browser: register a user, log in, add an item to the wishlist, buy it,
and confirm the order appears under My Orders and the seller's Analytics charts
move.

---

## Two things that will bite later

**The dashboard is the only source of truth for frontend env vars.**
`VITE_API_URL` and `VITE_CLOUDINARY_CLOUD_NAME` are read at **build** time, not
runtime. Editing them in the Vercel dashboard does nothing until a rebuild.
They are also invisible in the repo, so someone cloning this project fresh gets
a build pointing at `localhost:3000`. `client/.env.example` documents them.

**Rotating the old secrets is still outstanding.** The Atlas connection string
and Cloudinary keys that were previously committed were removed from the working
tree, and the current history is clean — verified across every commit. But
removing a secret does not un-leak one that was ever published. If the repo was
public with those values in it at any point, treat them as compromised:

- MongoDB: delete the old database user and create a new one.
- Cloudinary: rotate the API key/secret.
- `JWT_KEY`: set a new long random value. This invalidates all existing sessions,
  which is the goal.

The repo is **public**. Anything committed is world-readable.

---

## Local development, for reference

Runs with zero external services — no Atlas, no Cloudinary, no account setup:

```bash
# terminal 1
cd server && npm run dev      # http://localhost:3000, in-memory Mongo, auto-seeded

# terminal 2
cd client && npm run dev      # http://localhost:5173
```

With `MONGODB_URI` empty the server starts an in-memory MongoDB, seeds demo
data, and prints the demo credentials. Data resets on restart. This is
development-only; in production a missing `MONGODB_URI` is a hard startup
failure.

Check the whole stack:

```bash
cd server
npm test                # 32 tests: authz, atomic stock, validation, logout
./scripts/smoke.sh      # 47 end-to-end checks against a running server
```