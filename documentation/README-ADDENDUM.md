# Setup corrections to apply to the root README

The current README needs a verified installation sequence. A safe local sequence after resolving package configuration is:

```powershell
# From project root
npm install
npm install --prefix .\backend
npm install --prefix .\frontend

# Create backend/.env from backend/.env.example (once that example is added)
# Import database/schema.sql and database/seed.sql using MySQL.

# Terminal 1
Set-Location .\backend
npm run dev

# Terminal 2
Set-Location ..\frontend
npm run dev
```

The current backend runs `dotenv.config()` from the backend process working directory. Therefore, put the actual local configuration at `backend/.env`, or deliberately change the backend to load a root `.env` using an explicit path. Choose one approach and document it consistently. Do not commit the real `.env`.

The README should also document database version/prerequisites, exact fictional test accounts and how their passwords are generated (credentials submitted privately via Moodle), deployment URL, API base URL, build commands, known limitations and local fallback instructions.
