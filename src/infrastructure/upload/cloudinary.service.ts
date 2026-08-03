import { EnvVariable } from '@/config/env.validation';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    private readonly configService: ConfigService<EnvVariable, true>,
  ) {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      api_key: configService.get('CLOUDINARY_API_KEY', { infer: true }),
      api_secret: configService.get('CLOUDINARY_API_SECRET', { infer: true }),
    });
  }

  upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const writableStream = cloudinary.uploader.upload_stream(
        { folder: 'table-order/menu-items' },
        (error, result) => {
          if (error || !result) {
            this.logger.error(error);
            reject(new InternalServerErrorException('Uploaded failed'));
            return;
          }
          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(writableStream);
    });
  }
}
