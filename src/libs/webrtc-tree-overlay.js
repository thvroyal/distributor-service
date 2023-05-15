/* eslint-disable prefer-template */
/* eslint-disable no-bitwise */
const EE = require('event-emitter');
const debug = require('debug');

function hash(value) {
  let hashedValue = value;
  // Robert Jenkins' 32 bit integer hash function, adapted to return 31-bit number
  hashedValue = (hashedValue + 0x7ed55d16 + (hashedValue << 12)) & 0x7fffffff;
  hashedValue = (hashedValue ^ 0xc761c23c ^ (hashedValue >>> 19)) & 0x7fffffff;
  hashedValue = (hashedValue + 0x165667b1 + (hashedValue << 5)) & 0x7fffffff;
  hashedValue = ((hashedValue + 0xd3a2646c) ^ (hashedValue << 9)) & 0x7fffffff;
  hashedValue = (hashedValue + 0xfd7046c5 + (hashedValue << 3)) & 0x7fffffff;
  hashedValue = (hashedValue ^ 0xb55a4f09 ^ (hashedValue >>> 16)) & 0x7fffffff;
  return hashedValue;
}

// Wraps the WebRTC socket inside a channel to encapsulate
// the join-request protocol while allowing application-defined control
// protocols to be multiplexed
function Channel(id, socket) {
  const log = debug('webrtc-tree-overlay:channel(' + id + ')');
  this._log = log;
  const self = this;
  this.id = id;
  this._socket = socket
    .on('data', function (data) {
      log('received data:');
      log(data.toString());
      const message = JSON.parse(data);
      if (message.type === 'DATA') {
        log('data: ' + message.data);
        self.emit('data', message.data);
      } else if (message.type === 'JOIN-REQUEST') {
        log('join-request: ' + JSON.stringify(message));
        self.emit('join-request', message);
      } else {
        throw new Error('Invalid message type on channel(' + id + ')');
      }
    })
    .on('connect', function () {
      self.emit('connect', self);
    })
    .on('close', function () {
      log('closing');
      self.emit('close');
    })
    .on('error', function (err) {
      log(err.message);
      log(err.stack);
    });
}
EE(Channel.prototype);

Channel.prototype.send = function (data) {
  const message = JSON.stringify({
    type: 'DATA',
    data,
  });
  this._log('sending:');
  this._log(message);
  this._socket.send(message);
};

Channel.prototype._sendJoinRequest = function (req) {
  this._log('sending join request from ' + req.origin);
  if (req.type !== 'JOIN-REQUEST') {
    throw new Error('Invalid join request');
  }

  this._socket.send(JSON.stringify(req));
};

Channel.prototype.isParent = function () {
  return this.id === null;
};

Channel.prototype.destroy = function () {
  this._socket.destroy();
};

function Node(bootstrap, _opts) {
  if (!bootstrap) {
    throw new Error('Missing bootstrap client argument');
  }
  this.bootstrap = bootstrap;

  const opts = _opts || {};

  this.id = hash(Math.floor(Math.random() * 4294967296))
    .toString()
    .slice(0, 6);
  this._log = debug('webrtc-tree-overlay:node(' + this.id + ')');
  this.parent = null;
  this.children = {};
  this.childrenNb = 0;
  this._candidates = {};
  this._candidateNb = 0;
  this.peerOpts = opts.peerOpts || {};
  this.maxDegree = opts.maxDegree || 10;
  this._REQUEST_TIMEOUT_IN_MS = opts.requestTimeoutInMs || 30 * 1000;

  this._storedRequests = {};
  for (let i = 0; i < this.maxDegree; i += 1) {
    this._storedRequests[i] = [];
  }
}
EE(Node.prototype);

Node.prototype.join = function () {
  const self = this;

  self._log('creating a peer connection with options:');
  self._log(this.peerOpts);

  this.parent = new Channel(
    null,
    this.bootstrap.connect(null, {
      peerOpts: this.peerOpts,
      cb: () => {
        // Ignore boostrapping timeout, we use our own here
      },
    })
  );

  const timeout = setTimeout(function () {
    self._log('connection to parent failed');
    self.parent.destroy();
    self.parent = null;
  }, self._REQUEST_TIMEOUT_IN_MS);

  this.parent
    .on('join-request', this._handleJoinRequest.bind(this))
    .on('data', function (data) {
      self.emit('data', data, self.parent, true);
    })
    .on('connect', function () {
      self._log('connected to parent');
      self.emit('parent-connect', self.parent);
      clearTimeout(timeout);
    })
    .on('close', function () {
      self._log('parent closed');
      self.emit('parent-close', self.parent);
      self.parent = null;
    })
    .on('error', function (err) {
      self._log('parent error: ' + err);
      self.emit('parent-error', self.parent, err);
      self.parent = null;
    });

  return this;
};

Node.prototype._handleJoinRequest = function (req) {
  const self = this;
  self._log('_handleJoinRequest(' + req.origin + ')');
  self._log('childrenNb: ' + this.childrenNb + ', _candidateNb: ' + this._candidateNb + ', maxDegree: ' + this.maxDegree);
  if (Object.prototype.hasOwnProperty.call(this._candidates, req.origin)) {
    self._log('forwarding request to one of our candidates (' + req.origin.slice(0, 4) + ')');
    // A candidate is sending us more signal information
    this._candidates[req.origin]._socket.signal(req.signal);
  } else if (this.childrenNb + this._candidateNb < this.maxDegree) {
    self._log('creating a new candidate (' + req.origin + ')');
    // We have connections available for a new candidate
    this.createCandidate(req);
  } else {
    // Let one of our children handle this candidate
    this._delegate(req);
  }
};

Node.prototype._addChild = function (child) {
  this.childrenNb += 1;

  let childIdx = null;
  for (let i = 0; i < this.maxDegree; i += 1) {
    if (!this.children[i]) {
      childIdx = i;
      this.children[i] = child;
      break;
    }
  }

  if (childIdx === null) {
    this._log('children:');
    this._log(this.children);
    throw new Error('No space found for adding new child');
  }

  this._removeCandidate(child.id);
  return childIdx;
};

Node.prototype._removeChild = function (child) {
  let childIdx = null;
  for (let i = 0; i < this.maxDegree; i += 1) {
    if (this.children[i] === child) {
      childIdx = i;
      delete this.children[i];
      this.childrenNb -= 1;
    }
  }

  return childIdx;
};

Node.prototype.createCandidate = function (req) {
  const self = this;
  // Use the ID assigned by the bootstrap server to the originator
  // for routing requests
  const child = new Channel(req.origin, this.bootstrap.connect(req, { peerOpts: this.peerOpts }))
    .on('connect', function () {
      self._log('child (' + JSON.stringify(child.id) + ') connected');
      // eslint-disable-next-line no-use-before-define
      clearTimeout(timeout);
      const childIdx = self._addChild(child);

      // Process stored requests that belong to this child
      const storedRequests = self._storedRequests[childIdx].slice(0);
      self._storedRequests[childIdx] = [];

      storedRequests.forEach(function (_req) {
        child._sendJoinRequest(_req);
      });
      self.emit('child-connect', child);
    })
    .on('data', function (data) {
      self.emit('data', data, child, false);
    })
    .on('join-request', function (_req) {
      self._handleJoinRequest(_req);
    })
    .on('close', function () {
      self._log('child (' + JSON.stringify(child.id) + ') closed');
      self._removeChild(child);
      self._removeCandidate(child.id);
      self.emit('child-close', child);
    })
    .on('error', function (err) {
      self._log('child (' + JSON.stringify(child.id) + ') error: ');
      self._log(err);
      self._removeChild(child);
      self._removeCandidate(child.id);
      self.emit('child-error', child, err);
    });

  const timeout = setTimeout(function () {
    self._log('connection to child(' + child.id + ') failed');
    child.destroy();
    self._removeCandidate(child.id);
  }, self._REQUEST_TIMEOUT_IN_MS);

  this._addCandidate(child);
  return child;
};

Node.prototype._addCandidate = function (peer) {
  const self = this;
  if (Object.prototype.hasOwnProperty.call(this._candidates, peer.id)) {
    if (this._candidates[peer.id] !== peer) {
      throw new Error('Adding a different candidate with the same identifier as an existing one');
    } else {
      self._log('WARNING: re-adding the same candidate ' + peer.id);
    }
  } else {
    self._log('added candidate (' + peer.id + ')');
    this._candidates[peer.id] = peer;
    this._candidateNb += 1;
  }
};

Node.prototype._removeCandidate = function (id) {
  const self = this;
  if (Object.prototype.hasOwnProperty.call(this._candidates, id)) {
    delete this._candidates[id];
    this._candidateNb -= 1;
    self._log('removed candidate (' + id + ')');
  } else {
    self._log('candidate (' + id + ') not found, it may have been removed already');
  }
};

Node.prototype._delegateIndex = function (req) {
  // Deterministically choose one of our children, regardless of whether it is
  // connected or not at the moment.
  //
  // We combine the first bytes of the origin address with the node
  // id to derive the index of the child to use.
  const origin = Number.parseInt(req.origin.slice(0, 6), 16);
  const id = Number.parseInt(this.id, 10);
  const childIndex = hash(origin ^ id) % this.maxDegree;
  this._log('_delegateIndex: ' + childIndex + ', computed from origin ' + origin + ' and node.id ' + id);
  return childIndex;
};

Node.prototype._delegate = function (req) {
  const self = this;
  const childIndex = self._delegateIndex(req);
  self._log('delegating request (' + req.origin + ') to child[' + childIndex + ']');
  const child = this.children[childIndex];
  if (child) {
    self._log('forwarding request (' + req.origin + ') to child (' + child.id + ')');
    child._sendJoinRequest(req);
  } else {
    // Defer until the corresponding candidate
    // has joined
    this._storedRequests[childIndex].push(req);
  }
};

Node.prototype.becomeRoot = function (secret) {
  const self = this;
  this.bootstrap.root(secret, function (req) {
    if (!req.type) {
      req.type = 'JOIN-REQUEST';
    } else if (req.type !== 'JOIN-REQUEST') {
      throw new Error('Invalid request type');
    }
    self._handleJoinRequest(req);
  });
  return this;
};

Node.prototype.close = function () {
  if (this.parent) {
    this.parent.destroy();
    this.parent = null;
  }

  for (let i = 0; i < this.children.length; i += 1) {
    this.children[i].destroy();
  }
  this.children = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const c in this._candidates) {
    if (!Object.prototype.hasOwnProperty.call(this._candidates, c)) {
      this._candidates[c].destroy();
    }
  }
  this._candidates = {};
  this._candidateNb = 0;

  this.emit('close');
};

module.exports = Node;
