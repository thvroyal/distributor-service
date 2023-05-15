/* eslint-disable no-param-reassign */
const toObject = require('pull-stream-function-to-object');
const EE = require('event-emitter');

module.exports = function (stream, n) {
  n = n || 1;
  let _read;
  let _streamSinkCb;
  let started = false;
  let ended = false;
  let inProcess = 0;
  let processed = 0;
  let intervalStart = 0;
  let intervalEnd = 0;

  if (typeof stream === 'function') {
    stream = toObject(stream);
  }

  if (!stream.source || !stream.sink) {
    throw new Error('Through stream expected with both a sink and a source');
  }

  function close(err, cb) {
    let streamSinkCb;
    if (_streamSinkCb) {
      streamSinkCb = _streamSinkCb;
      _streamSinkCb = null;
    }

    if (ended) {
      if (cb) cb(ended);
      if (streamSinkCb) cb(ended);
      return;
    }
    ended = err;
    if (_read) _read(ended, function () {});
    if (streamSinkCb) streamSinkCb(ended);
    if (cb) cb(ended);
  }

  function read() {
    if (!_read) return;
    if (!_streamSinkCb) return;

    let streamSinkCb;

    if (!started) {
      started = true;
      intervalStart = Date.now();
      streamSinkCb = _streamSinkCb;
      _streamSinkCb = null;

      inProcess += 1;
      _read(ended, streamSinkCb);
    } else if (inProcess < n) {
      streamSinkCb = _streamSinkCb;
      _streamSinkCb = null;

      inProcess += 1;
      _read(ended, streamSinkCb);
    }
  }

  let limitedStream = {
    sink: (__read) => {
      _read = __read;
      stream.sink(function streamRead(abort, streamSinkCb) {
        if (ended) return streamSinkCb(ended);

        _streamSinkCb = function (err, data) {
          streamSinkCb(err, data);
        };
        if (abort) return close(abort);

        read();
      });
    },
    updateLimit: (l) => {
      if (typeof l !== 'number' || l <= 0) {
        throw new Error(`Invalid limit ${l}`);
      }
      n = l;
      read();
    },
    source: (abort, cb) => {
      stream.source(abort, function (err, data) {
        if (err) {
          return close(err, cb);
        }

        inProcess -= 1;
        processed += 1;
        if (processed >= n) {
          const p = processed;
          processed = 0;
          intervalEnd = Date.now();
          const elapsedInSec = (intervalEnd - intervalStart) / 1000;
          intervalStart = intervalEnd;
          limitedStream.emit('flow-rate', p / elapsedInSec, elapsedInSec, p);
        }
        cb(err, data);
        read();
      });
    },
  };

  limitedStream = EE(limitedStream);

  // eslint-disable-next-line no-restricted-syntax
  for (const p in stream) {
    if (
      Object.prototype.hasOwnProperty.call(stream, p) &&
      typeof stream[p] === 'function' &&
      p !== 'source' &&
      p !== 'sink' &&
      p !== 'on'
    ) {
      limitedStream[p] = stream[p].bind(stream);
    }
  }

  return limitedStream;
};
