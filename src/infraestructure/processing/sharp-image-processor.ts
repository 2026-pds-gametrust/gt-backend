import sharp from 'sharp';
import { EMediaVariantFormat } from '../../domain/media/entity/enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../../domain/media/entity/enums/EMediaVariantSize';
import {
  IImageProcessor,
  IInspectedImage,
  IProcessedVariant,
} from '../../domain/media/processing/image-processor.interface';

const IMAGE_SIZES = [
  EMediaVariantSize.THUMBNAIL,
  EMediaVariantSize.CARD,
  EMediaVariantSize.FULL,
] as const;

const SIZE_WIDTH: Record<(typeof IMAGE_SIZES)[number], number> = {
  [EMediaVariantSize.THUMBNAIL]: 200,
  [EMediaVariantSize.CARD]: 600,
  [EMediaVariantSize.FULL]: 1600,
};

const MIME_BY_FORMAT: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  tiff: 'image/tiff',
  gif: 'image/gif',
};

export class SharpImageProcessor implements IImageProcessor {
  async inspect(buffer: Buffer): Promise<IInspectedImage> {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new Error('invalid image');
    }
    const mime = MIME_BY_FORMAT[metadata.format];
    if (!mime || !['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
      throw new Error('unsupported image format');
    }
    return {
      mime,
      width: metadata.width,
      height: metadata.height,
    };
  }

  async process(buffer: Buffer): Promise<IProcessedVariant[]> {
    const variants: IProcessedVariant[] = [];
    for (const size of IMAGE_SIZES) {
      const width = SIZE_WIDTH[size];
      const jpeg = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
      variants.push({
        size,
        format: EMediaVariantFormat.JPEG,
        buffer: jpeg.data,
        width: jpeg.info.width,
        height: jpeg.info.height,
        contentType: 'image/jpeg',
      });

      const webp = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
      variants.push({
        size,
        format: EMediaVariantFormat.WEBP,
        buffer: webp.data,
        width: webp.info.width,
        height: webp.info.height,
        contentType: 'image/webp',
      });
    }
    return variants;
  }
}
