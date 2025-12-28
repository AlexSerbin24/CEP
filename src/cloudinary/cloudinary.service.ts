import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudinaryService {
    async uploadFile(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {

            const folder = this.getFolderByMimeType(file.mimetype);

            const uploadOptions: any = {
                folder,
                resource_type: 'auto',
            };

            // Если это изображение, добавляем трансформацию
            if (file.mimetype.startsWith('image/')) {
                uploadOptions.transformation = [
                    {
                        width: 100,
                        height: 100,
                        crop: 'fill',
                    },
                    {
                        quality: 'auto',
                    },
                ];
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed: no result'));
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }


    async deleteFile(url: string): Promise<any> {
        const publicId = this.getPublicIdFromUrl(url);
        return await cloudinary.uploader.destroy(publicId);
    }


    //Private methods
    
    private getFolderByMimeType(mimetype: string): string {
        if (mimetype.startsWith('image/')) {
            return 'avatars';
        } else if (mimetype.startsWith('video/')) {
            return 'videos';
        } else if (mimetype.includes('pdf')) {
            return 'documents';
        }
        return 'uploads';
    }

    private getPublicIdFromUrl(url: string): string {

        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL');
        }
        const pathParts = parts.slice(uploadIndex + 2);
        const pathWithExtension = pathParts.join('/');

        const publicId = pathWithExtension.replace(/\.[^/.]+$/, '');

        return publicId;
    }
}
