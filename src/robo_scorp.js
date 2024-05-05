const { Client, GatewayIntentBits, Events } = require('discord.js');
const { MessageGenerator } = require('./message_generation/message_generator');
const { TcpServer } = require('./tcp_server');
const logger = require('./logger');

class RoboScorp {
  #discordClient;
  #tcpServer;
  static LogLabel = { Discord: 'Discord.js', Internal: 'Roboscorp' };

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
    this.#discordClient.login(process.env.TOKEN).catch((err) => logger.error(err));
  }

  #onReady(client) {
    logger.info('The discord client started succesfully.', RoboScorp.LogLabel.Internal);

    client.channels
      .fetch(process.env.GREETINGS_CHANNEL_ID)
      .then((channel) => {
        channel.send(`🤖 Powstaję z żywych... 🤖`);
      })
      .catch((err) => logger.error(err, RoboScorp.LogLabel.Discord));
  }

  #onMessageCreate(message) {
    logger.debug('Message was created...', RoboScorp.LogLabel.Internal);
    if (message.author.id === this.user.id) {
      logger.debug('Message was created by the bot. Skipping.', RoboScorp.LogLabel.Internal);
      return;
    }

    try {
      logger.debug('Selecting a reply to message...', RoboScorp.LogLabel.Internal);

      const reply = MessageGenerator.selectReply(message);
      if (reply) {
        logger.debug(`Selected a reply: "${reply}". Sending...`, RoboScorp.LogLabel.Internal);

        message
          .reply(reply)
          .then((_) => logger.debug('Reply sent.', RoboScorp.LogLabel.Internal))
          .catch((err) => logger.error(err, RoboScorp.LogLabel.Discord));
        return;
      }
    } catch (err) {
      logger.error(`An error occured while generating a message: ${err}`, RoboScorp.LogLabel.Internal);
    }
    logger.debug(`No reply selected.`, RoboScorp.LogLabel.Internal);
  }

  #onError(err) {
    logger.error(err, RoboScorp.LogLabel.Discord);
    logger.info('Restarting the client...', RoboScorp.LogLabel.Internal);
    this.#discordClient.destroy();
    this.start();
  }

  #onWarning(warn) {
    logger.warn(warn, RoboScorp.LogLabel.Discord);
  }

  #onDebug(debug) {
    logger.debug(debug, RoboScorp.LogLabel.Discord);
  }

  #createDiscordClient() {
    logger.info('Starting the discord client...', RoboScorp.LogLabel.Internal);
    this.#discordClient.once(Events.ClientReady, this.#onReady);
    this.#discordClient.on(Events.MessageCreate, this.#onMessageCreate);
    this.#discordClient.on(Events.Error, this.#onError);
    this.#discordClient.on(Events.Warn, this.#onWarning);
    this.#discordClient.on(Events.Debug, this.#onDebug);
  }

  #createTcpServer() {
    this.#tcpServer = new TcpServer(process.env.TCP_CONNECTION_PORT, (tcpMessage) => {
      this.#discordClient.channels
        .fetch(process.env.MINECRAFT_COORDS_CHANNEL_ID)
        .then((channel) => {
          channel.messages
            .fetch(process.env.MINECRAFT_COORDS_MESSAGE_ID)
            .then((discordMessage) => {
              const codeblock = '```\n';
              discordMessage.edit(codeblock + tcpMessage + codeblock);
            })
            .catch(logger.error, RoboScorp.LogLabel.Discord);
        })
        .catch(logger.error, RoboScorp.LogLabel.Discord);
    });
  }
}

module.exports = { RoboScorp };
