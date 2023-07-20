const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const logger = require('../config/logger');
const { outputService, monitorService, userService } = require('../services/index');

const PROTO_PATH = path.join(process.cwd(), '/src/proto/pando.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const computeEngine = grpc.loadPackageDefinition(packageDefinition).compute_engine;

class GRPCServer {
  constructor() {
    this.server = new grpc.Server();
    this.server.addService(computeEngine.MyService.service, {
      runProject: this.runProject.bind(this),
      addOutput: (call, callback) => {
        const { value, createdAt, bucketId } = call.request;
        outputService.addOutput({ bucketId, createdAt, value });

        callback(null, {});
      },
      report: (call, callback) => {
        const { data, bucketId } = call.request;

        monitorService.reportProjectStatus(data, bucketId);
        userService.updateUserOutput(data);

        callback(null, {});
      },
    });

    // Initialize call variable as an instance variable
    this.call = [];
  }

  runProject(call) {
    this.call.push(call);

    call.on('end', () => {
      // Handle the end of the streaming from the client
      // ...
    });
  }

  async createProject(projectId) {
    return new Promise((resolve, reject) => {
      try {
        if (this.call.length > 0) {
          this.call[0].write({ id: projectId });

          this.call[0].on('data', (response) => {
            resolve(response);
          });
        } else {
          reject(new Error('No pando worker is available now!'));
        }
      } catch (error) {
        reject(new Error(error));
      }
    });
  }

  start(port) {
    this.server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (error, portUsed) => {
      logger.info(`gRPC server started on port ${portUsed}`);
      this.server.start();
    });
  }

  stop() {
    this.server.forceShutdown();
    logger.info('gRPC server stopped');
  }
}

module.exports = new GRPCServer();
