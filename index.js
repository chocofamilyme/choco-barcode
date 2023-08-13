import BarcodeScanner, { BarcodeFormats } from './dist';

BarcodeScanner.initScanner({
    container: 'barcode-scanner',
    formats: [BarcodeFormats.ean_13]
});
