import { BarcodeDetectorPolyfill, DetectedBarcode } from '@undecaf/barcode-detector-polyfill';
import { BarcodeInitOptimizedPayload, BarcodeFormats } from './types';

/**
 * Inner variables
 */
let detector: BarcodeDetectorPolyfill;
let requestId: number | null;
let video: HTMLVideoElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

/**
 * Public variables
 */
let container: HTMLElement | null = null;
let formats: BarcodeFormats[];
let isPaused = false;
let drawSymbols = false;
let videoSettings: MediaTrackConstraints;
let onSuccess: (symbols: string[]) => void;

/**
 * Create canvas element
 */
const initCanvas = () => {
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    container?.appendChild(canvas);
};

/**
 * Create video element
 */
const initVideoElement = (stream: MediaStream) => {
    video = document.createElement('video');
    video.setAttribute('id', 'video');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.setAttribute('autoplay', 'true');
    video.srcObject = stream;

    container?.appendChild(video);
};

/**
 * Draw detected barcode on canvas
 */
const drawSymbol = (symbols: DetectedBarcode[], source: HTMLVideoElement) => {
    if (!ctx) {
        return;
    }

    canvas.width = source.videoWidth || source.width;
    canvas.height = source.videoHeight || source.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    symbols.forEach(symbol => {
        const lastCornerPoint = symbol.cornerPoints[symbol.cornerPoints.length - 1];
        ctx.moveTo(lastCornerPoint?.x || 0, lastCornerPoint?.y || 0);
        symbol.cornerPoints.forEach(point => ctx.lineTo(point.x, point.y));

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00e000ff';
        ctx.stroke();
    });
};

/**
 * Get container element
 */
const getContainer = (value: HTMLElement | string) => {
    return !value
        ? document.querySelector<HTMLElement>('#barcode-scanner')
        : (container = typeof value === 'string' ? document.querySelector<HTMLElement>(`#${value}`) : value);
};

/**
 * Set barcode scanner settings
 */
const setBarcodeSettings = (payload: BarcodeInitOptimizedPayload) => {
    container = getContainer(payload.container || '');
    formats = payload.formats || [BarcodeFormats.ean_13, BarcodeFormats.ean_8, BarcodeFormats.code_128];
    videoSettings = { ...videoSettings, ...payload.settings };
    drawSymbols = payload.drawSymbols || false;
    onSuccess = payload.onSuccess;
};

/**
 * Create barcode detector instance
 */
const createDetector = async () => {
    const supportedFormats = await BarcodeDetectorPolyfill.getSupportedFormats();
    detector = new BarcodeDetectorPolyfill({ formats: formats || supportedFormats, zbar: { encoding: 'UTF-8' } });
};

/**
 * Detect barcodes on video stream and draw result on canvas if needed
 */
const detect = async (source: HTMLVideoElement) => {
    if (!detector) {
        return Promise.reject('Detector not found');
    }

    if (!source) {
        return Promise.reject('Source not found');
    }

    const symbols = await detector.detect(source);

    if (drawSymbols) {
        drawSymbol(symbols, source);
    }
    if (!isPaused && symbols.length > 0) {
        onSuccess(symbols.map(symbol => symbol.rawValue));
    }
    return symbols;
};

/**
 * Infinite loop to detect barcodes on video stream
 */
const detectVideo = (repeat = true) => {
    if (!repeat && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (repeat) {
        detect(video).then(() => (requestId = requestAnimationFrame(() => detectVideo(true))));
    } else {
        if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = null;
        }
    }
};

/**
 * Start video stream and detect barcodes
 */
const start = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: 'environment', ...videoSettings }
        });

        if (drawSymbols) {
            initCanvas();
        }

        initVideoElement(stream);
        detectVideo();

        return true;
    } catch {
        throw new Error('NOT_ALLOWED');
    }
};

/**
 * Destroy video stream and detector
 */
const destroy = () => {
    detectVideo(false);
    if (video && video.srcObject) {
        (video.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
    }
};

/**
 * Initialize barcode scanner
 */
const init = (payload: BarcodeInitOptimizedPayload) => {
    return new Promise((resolve, reject) => {
        setBarcodeSettings(payload);

        if (!container) {
            reject(new Error('NO_CONTAINER'));
        }

        createDetector().then(() => {
            start()
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    });
};

const BarcodeScannerOptimized = {
    init,
    destroy,
    pause: () => (isPaused = true),
    resume: () => (isPaused = false)
};

export { BarcodeScannerOptimized };
