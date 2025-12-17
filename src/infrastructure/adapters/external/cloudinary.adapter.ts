import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import {
  FileUploadService,
  UploadedFile,
} from '../../../application/ports/services/file-upload.service';

@Injectable()
export class CloudinaryAdapter implements FileUploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Buffer, fileName: string): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            public_id: `teslo-shop/${fileName}`,
            folder: 'teslo-shop',
          },
          (error, result) => {
            if (error) {
              reject(new Error(error.message || 'Upload failed'));
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
              });
            } else {
              reject(new Error('Upload failed'));
            }
          },
        )
        .end(file);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async uploadMultipleImages(
    files: { buffer: Buffer; fileName: string }[],
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file.buffer, file.fileName),
    );

    return Promise.all(uploadPromises);
  }
}
