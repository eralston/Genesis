import fs from 'fs/promises';
import path from 'path';

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

export async function readFileBuf(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

export async function writeFileBuf(filePath: string, data: Buffer | Uint8Array): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
