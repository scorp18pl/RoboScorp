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

    try {
      const reply = MessageGenerator.selectReply(message);
      if (reply) {
        message.reply(reply).catch(console.error);
      }
    } catch (error) {
      console.error('An exception occured while generating a message.', error);
    }
  }

  #onError(error) {
    console.error('A following discord.js error occured:', error);
    console.log('Restarting the client...');
    this.#discordClient.destroy();
    this.start();
  }

  #onWarning(warning) {
    console.warn('discord.js produced a following warning:', warning);
  }

  #onDebug(debug) {
    console.log('DEBUG: ', debug);
  }

  #createDiscordClient() {
    console.log('Starting the discord client...');
    this.#discordClient.once(Events.ClientReady, this.#onReady);
    this.#discordClient.on(Events.MessageCreate, this.#onMessageCreate);
    this.#discordClient.on(Events.Error, this.#onError);
    this.#discordClient.on(Events.Warn, this.#onWarning);
    this.#discordClient.on(Events.Debug, this.#onDebug);
  }

  #createTcpServer() {
    this.#tcpServer = new TcpServer(
      process.env.TCP_CONNECTION_PORT,
      (tcpMessage) => {
        this.#discordClient.channels
          .fetch(process.env.MINECRAFT_COORDS_CHANNEL_ID)
          .then((channel) => {
            channel.messages
              .fetch(process.env.MINECRAFT_COORDS_MESSAGE_ID)
              .then((discordMessage) => {
                const codeblock = '```\n';
                discordMessage.edit(codeblock + tcpMessage + codeblock);
              })
              .catch(console.error);
          })
          .catch(console.error);
      },
    );
  }
}

module.exports = { RoboScorp };
