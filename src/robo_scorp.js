const { Client, GatewayIntentBits } = require("discord.js");
const { MessageGenerator } = require("./message_generator");

class RoboScorp {
  static #greetingsChannelId = "1144687730907947148";
  #client;

  constructor() {
    this.#client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    this.#createClient();
  }

  start() {
    this.#client.login(process.env.TOKEN);
  }

  #onReady(client) {
    client.channels
      .fetch(RoboScorp.#greetingsChannelId)
      .then((channel) => {channel.send(`🤖 Powstaję z żywych... 🤖`);})
      .catch(console.error);
  }

  #onMessageCreate(message) {
    if (message.author.id === this.user.id) {
      return;
    }

    const reply = MessageGenerator.selectReply(message);
    if (reply) {
      message.reply(reply);
    }
  }

  #createClient() {
    this.#client.on("ready", this.#onReady);
    this.#client.on("messageCreate", this.#onMessageCreate);
  }
}

module.exports = { RoboScorp };
