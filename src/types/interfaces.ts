import { BarcodeFormats } from './enums';

export interface BarcodeInitPayload {
    container?: string | HTMLElement;
    formats?: BarcodeFormats[];
    settings?: MediaTrackSettings;
    drawSymbols?: boolean;
    onSuccess: (barcodes: string[]) => void;
}
