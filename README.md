# infobot-yandex-stt
Node.JS library for [Yandex Speech Cloud](https://cloud.yandex.ru/docs/speechkit/stt/) service.
Library can work in stream mode or recognize stored audio file.

To work with this library you need to obtain from Yandex Cloud:
* Private key in PEM format
* Service ID
* Service Key
* Folder ID

Please check [this page](https://cloud.yandex.ru/docs/iam/operations/sa/create) for information about service accounts.

## Audio file recognition example:
```javascript
const STT = require('infobot-yandex-stt');
const fs = require('fs');

const key = SERVICE_KEY ;
const folder_id = FOLDER_ID;
const service_id = SERVICE_ID;


const stt = new STT(service_id, key, folder_id, fs.readFileSync('./yandex.pem'));
stt.recognizeFile('test.wav').then(res => {
    console.log(JSON.stringify(res));
});
````


## Stream recognition example:
```javascript
const STT = require('infobot-yandex-stt');
const fs = require('fs');

const key = SERVICE_KEY ;
const folder_id = FOLDER_ID;
const service_id = SERVICE_ID;


const stt = new STT(service_id, key, folder_id, fs.readFileSync('./yandex.pem'));
stt.startRecognitionSession({
        language_code: 'ru-RU', // Possible values: ru-RU, en-US, tr-TR
        sample_rate_hertz: 8000, // Possible values: 8000, 16000, 48000
        audio_encoding: STT.FORMAT_PCM, // Possible values: FORMAT_PCM, FORMAT_OPUS 
        profanity_filter: false, // Make censored output
        partial_results: true // Send partial results
    }).then((recSess) => {
const Writable = require('stream').Writable;
const ws = Writable();
ws._write = function (chunk, enc, next) {
    recSess.writeChunk(chunk);
    next();
};

const readStream = fs.createReadStream(path);
readStream.pipe(ws);

readStream.on("end", function () {
    recSess.finishStream();
});

recSess.on('data', function (data) {
    if (data && data.chunks) {
        console.log(`Transcript: ${data.chunks[0].alternatives[0].text}`);
    }
});

recSess.on('error', function (data) {
    console.error(data);
});
}).catch((err) => {
    console.error(err);
});
````

Provided by [INFOBOT LLC.](https://infobot.pro) under ISC license.

