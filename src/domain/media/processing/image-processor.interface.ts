import { EMediaVariantFormat } from '../entity/enums/EMediaVariantFormat';
import { EMediaVariantSize } from '../entity/enums/EMediaVariantSize';

export interface IInspectedImage {
  mime: string;
  width: number;
  height: number;
}

export interface IProcessedVariant {
  size: EMediaVariantSize;
  format: EMediaVariantFormat;
  buffer: Buffer;
  width: number;
  height: number;
  contentType: string;
}

export interface IImageProcessor {
  inspect(buffer: Buffer): Promise<IInspectedImage>;
  process(buffer: Buffer): Promise<IProcessedVariant[]>;
}
