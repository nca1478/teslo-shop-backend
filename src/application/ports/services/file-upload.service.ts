export interface UploadedFile {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
}

export interface FileUploadService {
    uploadImage(file: Buffer, fileName: string): Promise<UploadedFile>;
    deleteImage(publicId: string): Promise<void>;
    uploadMultipleImages(files: { buffer: Buffer; fileName: string }[]): Promise<UploadedFile[]>;
}
