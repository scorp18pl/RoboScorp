const { Client, GatewayIntentBits, Events } = require("discord.js");
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

    console.log("Starting the client...");
    this.#createClient();
  }

  start() {
    this.#client.login(process.env.TOKEN).catch(console.error);
  }

  #onReady(client) {
    console.log("The client started succesfully.");
    client.channels
      .fetch(RoboScorp.#greetingsChannelId)
      .then((channel) => { channel.send(`🤖 Powstaję z żywych... 🤖`); })
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
    console.error("A following discord.js error occured.", error);
  }

  #createClient() {
    this.#client.once(Events.ClientReady, this.#onReady);
    this.#client.on(Events.MessageCreate, this.#onMessageCreate);
    this.#client.on(Events.Error, this.#onError);
  }
}

module.exports = { RoboScorp };
