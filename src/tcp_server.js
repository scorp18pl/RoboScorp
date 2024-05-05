const net = require('net');
const logger = require('./logger');

class TcpServer {
  #port;
  #server;
  #onMessageFunction;
  static LogLabel = 'TCP Server';

  constructor(port, onMessageFunction) {
    this.#port = port;
    this.#onMessageFunction = onMessageFunction;

    this.#server = net.createServer(this.#onClientConnection.bind(this));
    this.#server.listen(this.#port, () => {
      logger.debug(`Server started on port ${port}.`, TcpServer.LogLabel);
    });
  }

  #onClientConnection = (sock) => {
    sock.on('data', (data) => {
      const dataString = data.toString('utf8');
      if (dataString.length > 0) {
        logger.debug(`Received message: ${dataString}`, TcpServer.LogLabel);
        this.#onMessageFunction(dataString);
        return;
      }

      logger.debug('Received an empty message.', TcpServer.LogLabel);
    });

    sock.on('error', (error) => {
      logger.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}.`, TcpServer.LogLabel);
    });
  };
}

module.exports = { TcpServer };
