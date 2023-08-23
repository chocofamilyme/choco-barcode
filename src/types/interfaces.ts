import { BarcodeFormats } from './enums';

export interface BarcodeInitPayload {
    container?: string | HTMLElement;
    formats?: BarcodeFormats[];
    onSuccess: (barcodes: string[]) => void;
}
