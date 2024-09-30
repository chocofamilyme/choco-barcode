# Choco Barcode Scanner 🔎

### Посмотреть как работает
[👀 Тут](https://barcode-preview.netlify.app/)

### Установка

```
npm i choco-barcode-scanner
```

или

```
yarn add choco-barcode-scanner
```

### Поддерживаемые форматы

```typescript
enum BarcodeFormats {
    codabar = 'codabar',
    code_39 = 'code_39',
    code_93 = 'code_93',
    code_128 = 'code_128',
    databar = 'databar',
    databar_exp = 'databar_exp',
    ean_2 = 'ean_2',
    ean_5 = 'ean_5',
    ean_8 = 'ean_8',
    ean_13 = 'ean_13',
    ean_13_2 = 'ean_13+2',
    ean_13_5 = 'ean_13+5',
    isbn_10 = 'isbn_10',
    isbn_13 = 'isbn_13',
    isbn_13_2 = 'isbn_13+2',
    isbn_13_5 = 'isbn_13+5',
    itf = 'itf',
    qr_code = 'qr_code',
    sq_code = 'sq_code',
    upc_a = 'upc_a',
    upc_e = 'upc_e'
}
```

### Метод init

Инициализирует сканер штрихкода с заданными параметрами.

-   **payload.container**: Контейнер, в котором будет отображаться видео с камеры.
-   **payload.formats**: Массив форматов штрихкодов для сканирования.
-   **payload.settings**: Настройки камеры.
-   **payload.onSuccess**: Колбэк, который вызывается при успешном сканировании.
-   **payload.drawSymbols**: Показывать ли обводку сканируемого трихкода

Типизация:

```typescript
interface BarcodeInitPayload {
    container?: string | HTMLElement;
    formats?: BarcodeFormats[];
    settings?: MediaTrackSettings;
    drawSymbols?: boolean;
    onSuccess: (barcodes: string[]) => void;
}
```

Пример использования vanilla js:

```javascript
import { BarcodeScanner } from 'choco-barcode-scanner';

BarcodeScanner.init({
    container: 'barcode-container',
    formats: ['ean_13', 'ean_8'],
    settings: {
        width: 640,
        height: 480,
    },
    drawSymbols: true,
    onSuccess: barcodes => {}
}).catch(error => {
    if (error.message === 'NOT_ALLOWED') {
        // Пользователь не разрешил доступ к камере
    }

    if(error.message === 'NO_CONTAINER''){
        // Указан неверный контейнер
    }
});
```

### Метод destroy

Уничтожает сканер штрихкода.

```javascript
BarcodeScanner.destroy();
```

### Пример использования с Vue:

```javascript
<template>
    <div id="barcode-container"></div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { BarcodeScanner } from 'choco-barcode-scanner';

export default {
    setup() {
        const onSuccess = barcodes => {
            console.log(barcodes);
        };

        onMounted(() => {
            BarcodeScanner.init({
                container: 'barcode-container',
                formats: ['ean_13', 'ean_8'],
                drawSymbols: true,
                onSuccess
            }).catch(error => {
                if (error === 'NOT_ALLOWED') {
                    // Пользователь не разрешил доступ к камере
                }
            });
        });

        onUnmounted(() => {
            BarcodeScanner.destroy();
        });
    }
};
</script>
```
