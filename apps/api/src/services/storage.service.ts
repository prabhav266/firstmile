import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  folder?: string;
  allowedFormats?: string[];
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  fileName: string;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

export class StorageService {
  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, options: UploadOptions = {}): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (options.allowedFormats && !options.allowedFormats.includes(ext.replace('.', ''))) {
      throw new Error(`File format ${ext} is not allowed`);
    }

    const publicId = uuidv4();
    const fileName = `${publicId}${ext}`;
    const folderPath = options.folder ? path.join(UPLOAD_DIR, options.folder) : UPLOAD_DIR;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const relativeUrl = options.folder 
      ? `/uploads/${options.folder}/${fileName}`
      : `/uploads/${fileName}`;

    return {
      publicId,
      secureUrl: relativeUrl,
      fileName: file.originalname,
    };
  }

  async delete(publicId: string, folder?: string): Promise<void> {
    const folderPath = folder ? path.join(UPLOAD_DIR, folder) : UPLOAD_DIR;
    
    // Find file that starts with publicId
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      const fileToDelete = files.find(f => f.startsWith(publicId));
      if (fileToDelete) {
        fs.unlinkSync(path.join(folderPath, fileToDelete));
      }
    }
  }
}
export const storageService = new StorageService();
