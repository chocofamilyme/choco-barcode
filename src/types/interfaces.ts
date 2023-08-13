import { BarcodeFormats } from './enums';

export interface BarcodeInitPayload {
    container?: string | HTMLElement;
    formats?: BarcodeFormats[];
}
export type BarcodeInit = (payload: BarcodeInitPayload) => Promise<string[]>;
export type BarcodeDetectVideo = (repeat?: boolean) => Promise<string[]>;
export type BarcodeDetect = (video: HTMLVideoElement, formats?: BarcodeFormats[]) => Promise<string[]>;
export type BarcodeStopVideo = () => void;
