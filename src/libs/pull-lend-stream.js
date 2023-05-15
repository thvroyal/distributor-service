/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
const lend = require('pull-lend');
const debug = require('debug');

module.exports = function () {
  let connected = false; // The lender sink is connected
  let ended = false; // No more value to read
  let closed = false; // This lender is closed
  let aborted = false; // Aborted from downstream
  let opened = 0; // Number of subStreams still opened
  const lender = lend();
  let _cb = null;
  const log = debug('pull-lend-stream');

  function createSubStream() {
    let queue = [];
    let abort = false; // source aborted
    let pending = null;

    function close(existingAbort) {
      if (existingAbort) {
        if (pending) {
          const cb = pending;
          pending = null;
          cb(abort);
        }
        const q = queue.slice();
        log(`terminating ${q.length} pending callbacks`);
        queue = [];
        q.forEach(function (sink) {
          sink(abort);
        });
      }
    }

    function source(_abort, cb) {
      if (abort || _abort) {
        log(`sub-stream abort: ${_abort}`);
        abort = abort || _abort;
        close(abort);
        if (cb) cb(abort);
        return;
      }

      pending = cb;
      lender.lend(function (err, value, sink) {
        if (err) {
          log(`lender.lend(${err}, ...)`);
          if (pending) {
            cb = pending;
            pending = null;
            cb((ended = err));
          }
        } else if (abort || closed) {
          sink(abort || closed);
          if (pending) {
            cb = pending;
            pending = null;
            cb(abort || closed);
          }
        } else {
          queue.push(sink);
          if (pending !== cb) throw new Error('Invalid pending callback');
          pending = null;
          cb(null, value);
        }
      });
    }
    return {
      source,
      sink: (read) => {
        opened += 1;
        log(`opened sub-stream, ${opened} currently opened in total`);
        read(abort || aborted, function next(err, result) {
          if (err) {
            close(err);
            opened -= 1;
            if (opened < 0) throw new Error('Callback called more than once');
            log(`closing sub-stream, ${opened} still opened`);
            closeLender();
            return;
          }

          if (queue.length > 0) {
            const sink = queue.shift();
            sink(null, result);
          }

          read(abort || aborted, next);
        });
      },
      close: (err) => {
        err = err || true;
        source(err);
        close(err);
      },
    };
  }

  function closeLender() {
    if (_cb && closed && opened === 0) {
      log('closing lender');
      const cb = _cb;
      _cb = null;
      cb(closed);
    }
  }

  function state() {
    return {
      connected,
      ended,
      closed,
      openedNb: opened,
      lendState: lender._state(),
    };
  }

  return {
    sink: (read) => {
      connected = true;
      lender.sink(read);
    },
    lendStream: (borrower) => {
      log(`lendStream(${typeof borrower})`);
      log(`connected: ${connected}, ended: ${ended}, closed: ${closed}, opened: ${opened}`);
      if (!connected) return borrower(new Error('not connected'));
      if (ended) return borrower(ended);

      borrower(ended, createSubStream());
    },
    source: (abort, cb) => {
      if (abort) log(`source(${abort})`);
      aborted = abort;
      lender.source(abort, function (err, data) {
        if (err) {
          log(`lender.source.cb(${err})`);
          ended = closed;
          closed = err;
          _cb = cb;
          return closeLender();
        }
        cb(null, data);
      });
    },
    _state: state,
  };
};
