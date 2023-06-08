const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const initSocket = require('./socket');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  if (config.env === 'production') {
    const options = {
      key: fs.readFileSync(path.join(process.cwd(), 'cert', 'key.pem')),
      cert: fs.readFileSync(path.join(process.cwd(), 'cert', 'cert.pem')),
    };
    server = http.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  initSocket(server);
  server.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

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
