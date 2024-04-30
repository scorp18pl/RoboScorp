const { Client, GatewayIntentBits, Events } = require('discord.js');
const { MessageGenerator } = require('./message_generation/message_generator');
const { TcpServer } = require('./tcp_server');

class RoboScorp {
  #discordClient;
  #tcpServer;

  constructor() {
    this.#discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    console.log('Starting the discord client...');
    this.#createDiscordClient();

    this.#createTcpServer();
  }

  start() {
    this.#discordClient.login(process.env.TOKEN).catch(console.error);
  }

  #onReady(client) {
    console.log('The discord client started succesfully.');
    client.channels
      .fetch(process.env.GREETINGS_CHANNEL_ID)
      .then((channel) => {
        channel.send(`🤖 Powstaję z żywych... 🤖`);
      })
      .catch(console.error);
  }

  #onMessageCreate(message) {
    if (message.author.id === this.user.id) {
      return;
    }

    const reply = MessageGenerator.selectReply(message);
    if (reply) {
      message.reply(reply).catch(console.error);
    }
  }

  #onError(error) {
    console.error('A following discord.js error occured.', error);
  }

  #createDiscordClient() {
    this.#discordClient.once(Events.ClientReady, this.#onReady);
    this.#discordClient.on(Events.MessageCreate, this.#onMessageCreate);
    this.#discordClient.on(Events.Error, this.#onError);
  }

  #createTcpServer() {
    this.#tcpServer = TcpServer(
      process.env.TCP_CONNECTION_PORT,
      (message) => {},
    );
  }
}

module.exports = { RoboScorp };
