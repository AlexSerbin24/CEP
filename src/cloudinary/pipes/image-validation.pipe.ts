import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
    private readonly MAX_SIZE = 3 * 1024 * 1024
    transform(value: Express.Multer.File) {

        if (!value) {
            throw new BadRequestException('File is required');
        }

        if (value.size > this.MAX_SIZE) {
            throw new BadRequestException('File is too large. Max size is 3MB');
        }

        if (!this.validateMagicNumbers(value.buffer)) {
            throw new BadRequestException('Invalid file type. Only JPEG and PNG are allowed');
        }

        return value;
    }

    private validateMagicNumbers(buffer: Buffer): boolean {

        const header = buffer.toString('hex', 0, 4);

        const isPng = header === '89504e47';

        const isJpeg = header.startsWith('ffd8ff');

        return isPng || isJpeg;
    }
}