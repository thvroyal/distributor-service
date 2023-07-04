const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const initSocket = require('./socket');
const gRPCServer = require('./utils/GRPCServer');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  server = http.createServer(app);
  initSocket(server);
  server.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

gRPCServer.start(50051);

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
