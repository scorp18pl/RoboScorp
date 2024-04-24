const { Client, IntentsBitField } = require("discord.js");
const { MessageGenerator } = require("./message_generator");

class RoboScorp {
  static #greetingsChannelId = "1144687730907947148";
  #client;

  constructor() {
    this.#client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
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
