-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "releaseYear" INTEGER,
    "genre" TEXT,
    "coverArtUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'wishlist',
    "rating" INTEGER,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Rom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "absolutePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "sha256Hash" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Rom_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaveState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slot" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "SaveState_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SaveState_gameId_slot_key" ON "SaveState"("gameId", "slot");
