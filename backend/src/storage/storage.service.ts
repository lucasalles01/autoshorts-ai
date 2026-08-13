import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'storage');
    this.ensureFolders();
  }

  private ensureFolders() {
    const folders = ['originals', 'audio', 'previews', 'clips', 'renders', 'thumbnails', 'tmp', 'subtitles'];
    for (const folder of folders) {
      const dir = path.join(this.baseDir, folder);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  public getStoragePath(folder: string, filename: string): string {
    return path.join(this.baseDir, folder, filename);
  }

  public get root(): string {
    return this.baseDir;
  }

  /** Caminho absoluto a partir de uma storageKey no formato "clips/arquivo.mp4". */
  public resolveKey(storageKey: string): string {
    return path.join(this.baseDir, storageKey);
  }

  /** URL servida pelo Fastify em /api/files/<folder>/<filename>. */
  public getPublicUrl(folder: string, filename: string): string {
    return `${env.STORAGE_ENDPOINT}/api/files/${folder}/${filename}`;
  }

  public async saveFile(folder: string, filename: string, buffer: Buffer): Promise<string> {
    const filePath = this.getStoragePath(folder, filename);
    await fs.promises.writeFile(filePath, buffer);
    return this.getPublicUrl(folder, filename);
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    return false;
  }
}

export const storageService = new StorageService();
