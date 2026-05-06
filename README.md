# Genesis

A local Electron app for managing and playing your Sega Genesis game collection. Written in TypeScript throughout, with JavaScript compatibility where required (e.g. EmulatorJS).

## Features

- **Game Library** — Browse your collection in a cover-art grid. Track owned vs. wishlist status, write personal notes, and assign ratings.
- **ROM Manager** — Import `.md`, `.bin`, `.gen`, and `.smd` ROM files. Binaries are stored on the filesystem; the database serves as a searchable index with manually-populated metadata.
- **In-App Emulator** — Play games directly in the Electron renderer via EmulatorJS (WASM-based Genesis core). Save states are persisted to disk via the main process.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| App shell | Electron |
| Language | TypeScript (strict), JS where required |
| Renderer | React 18 + Vite |
| Main ↔ Renderer | Electron IPC (contextBridge, typed channels) |
| Database | SQLite via Prisma ORM (main process only) |
| Emulator | EmulatorJS |
| Build / packaging | electron-builder |

## Project Structure

```
genesis/
├── src/
│   ├── main/            # Electron main process (TypeScript)
│   │   ├── ipc/         # IPC handlers: games, roms, saves
│   │   ├── db/          # Prisma schema + migrations
│   │   └── lib/         # File system helpers, ROM validation
│   └── renderer/        # React + Vite renderer (TypeScript)
│       ├── components/
│       ├── pages/       # Library, ROMManager, Player, GameDetail
│       └── hooks/
├── roms/                # ROM file storage (gitignored)
├── saves/               # Save state storage (gitignored)
├── electron-builder.yml
└── README.md
```

## Data Model

- **Game** — title, description, releaseYear, genre, coverArtUrl, status (`owned` | `wishlist`), rating, notes
- **Rom** — filename, absolutePath, fileSize, sha256Hash, gameId (FK)
- **SaveState** — slot, filePath, createdAt, gameId (FK)

## IPC Channels

All IPC is exposed via a typed `preload.ts` using `contextBridge`. The renderer never accesses Node APIs directly.

| Channel | Direction | Description |
|---------|-----------|-------------|
| `games:list` | renderer → main | Fetch all games from DB |
| `games:upsert` | renderer → main | Create or update a game record |
| `games:delete` | renderer → main | Remove a game and its ROM index entries |
| `roms:import` | renderer → main | Copy ROM file to `roms/`, validate, index in DB |
| `roms:read` | renderer → main | Read ROM binary into buffer for EmulatorJS |
| `saves:read` | renderer → main | Load save state file |
| `saves:write` | renderer → main | Persist save state to disk |

## Security Notes

- The renderer runs with `nodeIntegration: false` and `contextIsolation: true`; all filesystem and DB access is gated through typed IPC handlers in the main process.
- ROM imports are validated by file extension whitelist and magic bytes before being copied to the managed `roms/` directory.
- No network requests in the initial scope — no credentials or API keys required.

## Getting Started (planned)

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --schema src/main/db/schema.prisma

# Start in development mode (Vite + Electron)
npm run dev

# Package for distribution
npm run build
```

## Roadmap

- [ ] Project scaffold (Electron + Vite + React + TypeScript, Prisma setup)
- [ ] Game library CRUD with manual metadata entry
- [ ] ROM import, validation (magic bytes), and filesystem management
- [ ] EmulatorJS integration + in-app play
- [ ] Save state persistence (read/write via IPC)
- [ ] Cover art display (local image file) + library grid UI
- [ ] Wishlist / owned toggle + rating / notes UI

## Future Scope

- **IGDB metadata lookup** — Auto-populate game info (title, description, cover art, release date) from the IGDB API (requires free Twitch developer account), with manual override. Deferred until the core library and emulator are stable.

