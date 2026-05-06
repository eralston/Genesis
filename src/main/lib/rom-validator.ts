import fs from 'fs/promises';

const ALLOWED_EXTENSIONS = new Set(['.md', '.bin', '.gen', '.smd']);

// Sega Genesis ROM header: the string "SEGA" appears at offset 0x100 in licensed ROMs.
// Some ROMs also start with "SEGA" at offset 0 (SMS / GG overlap) or use SMD interleave.
const GENESIS_MAGIC = Buffer.from('SEGA');

/**
 * Returns true if the file extension is in the allowed list.
 */
export function hasValidExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf('.');
  if (dot === -1) return false;
  return ALLOWED_EXTENSIONS.has(lower.slice(dot));
}

/**
 * Returns true if the file contains a recognisable Sega Genesis header.
 * Checks offset 0x100 for the SEGA magic bytes (standard licensed ROMs).
 */
export async function hasValidMagicBytes(filePath: string): Promise<boolean> {
  const fd = await fs.open(filePath, 'r');
  try {
    // Standard Genesis ROM: "SEGA" at 0x100
    const buf = Buffer.alloc(4);
    const { bytesRead } = await fd.read(buf, 0, 4, 0x100);
    if (bytesRead === 4 && buf.equals(GENESIS_MAGIC)) return true;

    // Some ROMs have "SEGA" at offset 0
    const { bytesRead: br2 } = await fd.read(buf, 0, 4, 0);
    if (br2 === 4 && buf.equals(GENESIS_MAGIC)) return true;

    return false;
  } finally {
    await fd.close();
  }
}
