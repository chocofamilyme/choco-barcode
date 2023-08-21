import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill';

declare global {
    interface Window {
        BarcodeDetector?: typeof BarcodeDetectorPolyfill;
    }
}
