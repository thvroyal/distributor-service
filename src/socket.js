const io = require('socket.io');
const logger = require('./config/logger');
const socketEvent = require('./events');

const initSocket = (server) => {
  const ioServer = io(server);

  ioServer.on('connection', (socket) => {
    logger.info('a user connected');

    socketEvent(ioServer, socket);

    socket.on('disconnect', () => {
      socket.broadcast.emit('user disconnected');
      logger.warn('user disconnected');
    });
  });
};

module.exports = initSocket;
