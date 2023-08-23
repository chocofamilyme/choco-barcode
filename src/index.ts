import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill';
import { BarcodeInitPayload, BarcodeFormats } from './types';

let detector: BarcodeDetectorPolyfill | null;
let requestId: number | null = null;
let video: HTMLVideoElement;
let formats: BarcodeFormats[] = [];
let container: HTMLElement | null;
let onSuccess: (barcodes: string[]) => void;
let isPaused = false;

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
        if (!isPaused) {
            onSuccess(barcodes.map(barcode => barcode.rawValue));
        }
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
    }

    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
    }
};

const destroy = () => {
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
        detectVideo(false);

        if (video.srcObject) {
            (video.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
        }
    }
};

const start = () => {
    return new Promise((resolve, reject) => {
        if (!requestId) {
            navigator.mediaDevices
                .getUserMedia({
                    audio: false,
                    video: { facingMode: 'environment' }
                })
                .then(async stream => {
                    const videoElement = createVideoElement(stream);
                    container?.appendChild(videoElement);
                    await detectVideo();
                    resolve(true);
                })
                .catch(error => {
                    reject(new Error('NOT_ALLOWED'));
                });
        } else {
            detectVideo(false);
            resolve(false);
        }
    });
};

const pause = () => (isPaused = true);
const resume = () => (isPaused = false);

const initScanner = async (
    payload: BarcodeInitPayload = {
        container: 'barcode-scanner',
        formats: [BarcodeFormats.ean_13, BarcodeFormats.ean_8, BarcodeFormats.code_128],
        onSuccess: () => {}
    }
) => {
    return new Promise((resolve, reject) => {
        if (!payload.container) {
            container = document.querySelector<HTMLElement>('#barcode-scanner');
        } else {
            container =
                typeof payload.container === 'string'
                    ? document.querySelector<HTMLElement>(`#${payload.container}`)
                    : payload.container;
        }

        if (!container) {
            reject(new Error('NO_CONTAINER'));
        }

        if (payload.formats) {
            formats = payload.formats;
        }

        if (payload.onSuccess) {
            onSuccess = payload.onSuccess;
        }

        start()
            .then(() => {
                resolve(true);
            })
            .catch(error => {
                reject(error);
            });
    });
};

const BarcodeScanner = {
    init: initScanner,
    destroy,
    pause,
    resume
};

export * from './types';
export { BarcodeScanner };
