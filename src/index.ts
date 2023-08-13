import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill';
import { BarcodeFormats } from './types/enums';
import { BarcodeInitPayload } from './types/interfaces';

let detector: BarcodeDetectorPolyfill | null;
let requestId: number | null = null;
let video: HTMLVideoElement;
let formats: BarcodeFormats[] | string[] = [];
let container: HTMLElement;

const createVideoElement = (stream: MediaProvider) => {
    video = document.createElement('video');
    video.setAttribute('id', 'barcode-video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.srcObject = stream;
    video.classList.add('barcode-video');

    return video;
};

const detect = async (video: HTMLVideoElement) => {
    if (!detector) {
        const supportedFormats = await BarcodeDetectorPolyfill.getSupportedFormats();
        detector = new BarcodeDetectorPolyfill({ formats: formats || supportedFormats });
    }

    const barcodes = await detector.detect(video);
    if (barcodes.length > 0) {
        return barcodes;
    }

    requestId = requestAnimationFrame(() => detect(video));
};

const detectVideo = (repeat = true) => {
    if (repeat) {
        return detect(video).then(() => {
            if (requestId) {
                requestId = requestAnimationFrame(() => detectVideo(true));
            }
        });
    } else {
        if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = null;
        }
    }
};

const stopVideo = () => {
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
        detectVideo(false);
    }
};

const start = () => {
    if (!requestId) {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: { facingMode: 'environment' }
            })
            .then(async stream => {
                container.appendChild(createVideoElement(stream));
                const barcodes = await detectVideo();
                return barcodes;
            })
            .catch(error => {
                throw error;
            });
    } else {
        detectVideo(false);
    }
};

const initScanner = async (payload?: BarcodeInitPayload) => {
    formats = payload?.formats || [];
    container =
        payload?.container instanceof HTMLElement
            ? payload.container
            : (document.querySelector(`#${payload?.container}` || '#barconde') as HTMLElement);

    return start();
};

const BarcodeScanner = {
    initScanner
};

export default BarcodeScanner;
export * from './types';
