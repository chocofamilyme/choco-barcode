import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill';

declare global {
    var BarcodeDetector: typeof BarcodeDetectorPolyfill | undefined;
}
