import { BarcodeFormats } from './enums';

export interface BarcodeInitPayload {
    container?: string | HTMLElement;
    formats?: BarcodeFormats[];
    settings?: MediaTrackSettings;
    onSuccess: (barcodes: string[]) => void;
}
