const net = require('net');

class TcpServer {
  #port;
  #server;
  #onMessageFunction;

  constructor(port, onMessageFunction) {
    this.#port = port;
    this.#onMessageFunction = onMessageFunction;

    this.#server = net.createServer(this.#onClientConnection.bind(this));
    this.#server.listen(this.#port, () => {
      console.log(`TCP Server: Server started on port ${port}.`);
    });
  }

  #onClientConnection = (sock) => {
    sock.on('data', (data) => {
      const dataString = data.toString('utf8');
      if (dataString.length > 0) {
        this.#onMessageFunction(dataString);
      } else {
        console.log('TCP Server: Received an empty string.');
      }
    });

    sock.on('error', (error) => {
      console.error(
        `TCP Server: ${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}.`,
      );
    });
  };
}

module.exports = { TcpServer };
