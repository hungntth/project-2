import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor() {
    // Đảm bảo thư mục uploads tồn tại khi khởi động
    const uploadsDir = join(process.cwd(), 'uploads', 'images');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
  }
}

