import { BarcodeDetectorPolyfill } from '@undecaf/barcode-detector-polyfill';
import { BarcodeInitPayload } from './types/interfaces';

let detector: BarcodeDetectorPolyfill | null;
let requestId: number | null = null;
let video: HTMLVideoElement;
let formats: string[] = [];
let container: HTMLElement | null;
let onSuccess: (barcodes: string[]) => void;

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
        if (!window.BarcodeDetector) {
            window.BarcodeDetector = BarcodeDetectorPolyfill;
        }

        const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
        detector = new window.BarcodeDetector({ formats: formats || supportedFormats });
    }

    const barcodes = await detector.detect(video);
    if (barcodes.length > 0) {
        onSuccess(barcodes.map(barcode => barcode.rawValue));
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
                    reject(new Error('Camera not allowed'));
                });
        } else {
            detectVideo(false);
            resolve(false);
        }
    });
};

const initScanner = async (
    payload: BarcodeInitPayload = {
        container: 'barcode-scanner',
        formats: ['ean_13', 'ean_8', 'code_128'],
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
            reject(new Error('Container not found'));
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
    destroy
};

export default BarcodeScanner;
