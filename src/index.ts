import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill';
import { BarcodeInitPayload, BarcodeFormats } from './types';

let detector: BarcodeDetectorPolyfill | null;
let requestId: number | null = null;
let video: HTMLVideoElement;
let formats: BarcodeFormats[] = [];
let container: HTMLElement | null;
let videoSettings: MediaTrackConstraints;
let onSuccess: (barcodes: string[]) => void;
let isPaused = false;

const pause = () => (isPaused = true);
const resume = () => (isPaused = false);

const createVideoElement = (stream: MediaProvider) => {
    video = document.createElement('video');
    video.setAttribute('id', 'barcode-video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.setAttribute('controls', 'false');
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
                    video: { facingMode: 'environment', ...videoSettings }
                })
                .then(async stream => {
                    const videoElement = createVideoElement(stream);
                    container?.appendChild(videoElement);
                    await detectVideo();
                    resolve(true);
                })
                .catch(() => {
                    reject(new Error('NOT_ALLOWED'));
                });
        } else {
            detectVideo(false);
            resolve(false);
        }
    });
};

const getContainer = (value: HTMLElement | string) => {
    return !value
        ? document.querySelector<HTMLElement>('#barcode-scanner')
        : (container = typeof value === 'string' ? document.querySelector<HTMLElement>(`#${value}`) : value);
};

const initScanner = async (payload: BarcodeInitPayload) => {
    return new Promise((resolve, reject) => {
        container = getContainer(payload.container || '');
        formats = payload.formats || [BarcodeFormats.ean_13, BarcodeFormats.ean_8, BarcodeFormats.code_128];
        videoSettings = payload.settings || {};
        onSuccess = payload.onSuccess;

        if (!container) {
            reject(new Error('NO_CONTAINER'));
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
