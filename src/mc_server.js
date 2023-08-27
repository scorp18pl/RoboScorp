const childProcess = require("child_process");

class McServer {
  constructor() {
    this.ipString = "";
    this.ngrok = null;
    this.mc = null;
  }

  publishIp(channel, ipString) {
    channel.send(`⚒️ Kloce IP ⚒️: ${ipString}`);
  }

  ngrokStartup(channel) {
    this.ngrok = childProcess.spawn(
      "../../ngrok.exe",
      ["tcp", "25565", "--log", "stdout"],
      { cwd: __dirname, shell: true }
    );

    this.ngrok.stdout.on("data", (data) => {
      const message = String(data);
      const addressRegex = /[0-9].tcp.eu.ngrok.io:[0-9]{5}/;
      const ipAddress = message.match(addressRegex);
      if (ipAddress) {
        this.publishIp(channel, ipAddress);
      }

      console.log(`[ngrok]:${data}`);
    });
  }

  start(channel) {
    this.ngrokStartup(channel);
  }
}

module.exports = { McServer };
