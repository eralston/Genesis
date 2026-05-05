# Genesis

A single-user local web app for managing and playing your Sega Genesis game collection.

## Features

- **Game Library** — Browse your collection in a cover-art grid. Track owned vs. wishlist status, write personal notes, and assign ratings.
- **ROM Manager** — Upload `.md`, `.bin`, `.gen`, and `.smd` ROM files and associate them with library entries.
- **In-Browser Emulator** — Play games directly in the browser via EmulatorJS (WASM-based Genesis core). Save states are persisted on the backend.
- **Metadata Lookup** — Auto-populate game info (title, description, cover art, release date) from the IGDB API, with full manual override.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Fastify |
| Database | SQLite via Prisma ORM |
| Emulator | EmulatorJS |
| Game Metadata | IGDB API (free, requires Twitch dev account) |

## Project Structure

```
genesis/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/       # Library, ROMManager, Player, GameDetail
│       └── hooks/
├── server/          # Node.js + Fastify backend
│   ├── routes/      # games, roms, saves, igdb-proxy
│   ├── db/          # Prisma schema + migrations
│   └── lib/         # file handling, IGDB client
├── roms/            # ROM file storage (gitignored)
├── saves/           # Save state storage (gitignored)
└── README.md
```

## Data Model

- **Game** — title, description, releaseYear, genre, coverArtUrl, status (`owned` | `wishlist`), rating, notes
- **Rom** — filename, filepath, fileSize, sha256Hash, gameId (FK)
- **SaveState** — slot, data (blob), createdAt, gameId (FK)

## API Routes (Fastify)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/games` | List all games |
| POST | `/api/games` | Add a game |
| PUT | `/api/games/:id` | Update game metadata/notes/rating |
| DELETE | `/api/games/:id` | Remove a game |
| POST | `/api/roms/upload` | Upload a ROM file (multipart) |
| GET | `/api/roms/:id/file` | Stream ROM to emulator |
| GET | `/api/igdb/search?q=` | Proxy search to IGDB |
| GET/POST | `/api/saves/:gameId` | Fetch or write save states |

## Security Notes

- ROM files are served through the backend (not as static assets) to prevent direct path traversal.
- File uploads are validated by extension whitelist and MIME type before storage.
- IGDB API credentials are stored in `.env` and never exposed to the client (proxied through the backend).

## Getting Started (planned)

```bash
# Install dependencies
npm install --workspaces

# Set up environment
cp server/.env.example server/.env
# → Add TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET from dev.twitch.tv

# Run database migrations
npx prisma migrate dev --schema server/db/schema.prisma

# Start dev servers
npm run dev
```

## Roadmap

- [ ] Project scaffold (Vite + Fastify monorepo, Prisma setup)
- [ ] Game library CRUD + IGDB metadata lookup
- [ ] ROM upload, validation, and file management
- [ ] EmulatorJS integration + in-browser play
- [ ] Save state persistence
- [ ] Cover art display + library grid UI
- [ ] Wishlist / owned toggle + rating / notes UI

