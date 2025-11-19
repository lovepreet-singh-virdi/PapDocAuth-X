# Postman Guide — PapDocAuthX Backend

This guide explains how to use the included Postman collection (`postman_collection.json`) and environment (`postman_environment.json`) to exercise every API endpoint in the backend.

## Files created
- `postman_collection.json` — Full API collection (root of repo)
- `postman_environment.json` — Local environment variables

> If `postman_collection.json` is missing, run the script below to generate or ask me to re-create it.

## Quick start

1. Start backend locally:

```powershell
# from project root
npm install
npm run dev
```

2. Open Postman
3. Import files:
   - `postman_collection.json` (File -> Import)
   - `postman_environment.json` (Import -> choose file or paste contents into Environments)
4. Select environment `PapDocAuthX Local` in Postman (top-right)

## Recommended order (run these requests in sequence)

1. `Auth / Register Superadmin` — create initial superadmin (one-time). If already created, skip.
2. `Auth / Login (get JWT)` — logs in and saves `jwt` into environment automatically.
3. `Organizations / Create Organization (superadmin)` — creates `orgId` variable.
4. `Organizations / Create Org Admin (superadmin)` — creates admin user in org.
5. `Documents / Upload Document Version` — uploads a sample version. Response saves `docId` and `versionHash`.
6. `Verification / Crypto Check` — authenticated verification endpoint.
7. `Verification / Public Verify` — public verification endpoint (no JWT).
8. `QR / Generate QR` — returns QR data for provided `docId`.
9. `Audit / Verify Audit Chain` — verify audit chain integrity for org/doc.
10. `Analytics / Get Org Summary` — returns analytics for the org.

## How to run automated token saving
- The `Login` request has a Tests script that captures `res.token` and stores it into `jwt` environment variable. Make sure you run Login and that the response contains `token`.

## Useful variables
- `{{baseUrl}}` — e.g., `http://localhost:3000/api`
- `{{jwt}}` — set automatically after login
- `{{orgId}}`, `{{docId}}`, `{{versionHash}}` — auto-set by some requests' Tests scripts

## Adding new requests
- Use `{{jwt}}` in the `Authorization` header as `Bearer {{jwt}}` for authenticated routes.
- Use `{{baseUrl}}` to reference API host.

## Troubleshooting
- If a request returns 401: ensure `Login` was run and `jwt` variable is set.
- If `orgId` or `docId` is empty after running creation endpoints: check response body and adjust Tests script accordingly.
- If backend not reachable: ensure `npm run dev` is running and `baseUrl` points to the correct host and port.

## Recreate the collection
If `postman_collection.json` didn't save or was removed, tell me and I'll re-generate it into the repo.

---

If you'd like, I can now re-create `postman_collection.json` (it failed earlier because the file already existed). Do you want me to overwrite it with an updated collection that includes additional fields and pre-request scripts?