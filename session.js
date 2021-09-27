var EventEmitter = require('events').EventEmitter;
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var PROTO_PATH = __dirname + '/stt_service.proto';

class RecognitionSession {
    constructor(token, specification, folderID) {
        var self = this;
        self.events = new EventEmitter;
        self.isEnd = false;

        let packageDefinition = protoLoader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

        let metadata = new grpc.Metadata();
        metadata.set('authorization', 'Bearer ' + token);

        let stt_proto = grpc.loadPackageDefinition(packageDefinition).yandex.cloud.ai.stt.v2;
        let ssl_creds = grpc.credentials.createSsl();
        let client = new stt_proto.SttService('stt.api.cloud.yandex.net:443', ssl_creds);
        self._call = client.StreamingRecognize(metadata);

        self._call.on('data', function (data) {
            self._onData(data)
        });
        self._call.on('error', function (data) {
            self._onError(data)
        });

        self._call.on('end', () => {
            this.isEnd = true;
        });

        var config = {
            config: {
                folder_id: folderID,
                specification: specification
            },
        };
        self._call.write(config);
    }

    _onData(data) {
        this.events.emit('data', data);
    }

    _onError(data) {
        this.events.emit('error', data);
    }

    writeChunk(chunk) {
        if (!this.isEnd) {
            this._call.write({audio_content: chunk});
        }
    }

    finishStream() {
        this.isEnd = false;
        this._call.end();
    }

    on(event, callback) {
        this.events.on(event, callback);
    }

    once(event, callback) {
        this.events.once(event, callback);
    }
}

module.exports = RecognitionSession;
