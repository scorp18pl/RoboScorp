const net = require('net');

class TcpServer {
  #port;
  #server;
  #onMessageFunction;

  constructor(port, onMessageFunction) {
    this.#port = port;
    this.#onMessageFunction = onMessageFunction;

    this.#server = net.createServer(this.#onClientConnection);
    this.#server.listen(this.#port, () => {
      console.log(`Server started on port ${port}`);
    });

    this.#server.listen(this.#port);
  }

  #onClientConnection(sock) {
    console.log(`${sock.remoteAddress}:${sock.remotePort} Connected`);

    sock.on('data', function (data) {
      if (typeof data === 'string') {
        this.#onMessageFunction(data);
      }
    });

    sock.on('close', function () {
      console.log(`${sock.remoteAddress}:${sock.remotePort} Connection closed`);
    });

    sock.on('error', function (error) {
      console.error(
        `${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`,
      );
    });
  }
}

module.exports = { TcpServer };
