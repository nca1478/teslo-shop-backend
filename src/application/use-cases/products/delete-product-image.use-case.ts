import { Injectable, Inject } from '@nestjs/common';
import type { ProductRepository } from '../../ports/repositories/product.repository';
import type { FileUploadService } from '../../ports/services/file-upload.service';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface DeleteProductImageRequest {
  productId: string;
  imageUrl: string;
}

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(INJECTION_TOKENS.FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: FileUploadService,
  ) {}

  async execute(request: DeleteProductImageRequest): Promise<void> {
    const { productId, imageUrl } = request;

    // Check if product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundDomainException('Product', productId);
    }

    // Check if image exists in product
    if (!product.images.includes(imageUrl)) {
      throw new NotFoundDomainException('Image', imageUrl);
    }

    // Extract Cloudinary public ID from URL
    const publicId = this.extractPublicIdFromUrl(imageUrl);

    // Delete from Cloudinary
    if (publicId) {
      await this.fileUploadService.deleteImage(publicId);
    }

    // Delete from ProductImage table using the dedicated method
    await this.productRepository.deleteProductImage(productId, imageUrl);
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Extract public ID from Cloudinary URL
      // Example: https://res.cloudinary.com/dqy43pvrm/image/upload/v1766170298/ta7e7j2fpu59wouelazf.jpg
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename.split('.')[0]; // Remove file extension
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }
}
