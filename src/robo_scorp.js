const { Client, IntentsBitField } = require("discord.js");
const { McServer } = require("./mc_server");
const { MessageGenerator } = require("./message_generator");

class RoboScorp {
  static #greetingsChannelId = "1144687730907947148";
  static #mcServer = new McServer();
  #client;
  static #seenMembers = [];

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

  #onVoiceStateUpdate(oldState, newState) {
    if (!oldState.channelId || !newState.channelId) {
      RoboScorp.#greetMember(
        this,
        newState.member,
        newState.channelId == null
      );
    }
  }

  static #greetMember(client, member, hasLeft) {

    let message = null;
    if (hasLeft) {
      message = MessageGenerator.getFarewellMessage(member.id);
    } else if (!(member.id in RoboScorp.#seenMembers)) {
      RoboScorp.#seenMembers.push(member.id);
      message = MessageGenerator.getWelcomeMessage(member.id);
    }

    if (!message) {
      return;
    }

    client.channels
      .fetch(RoboScorp.#greetingsChannelId)
      .then((channel) => {
        channel.send(message);
      })
      .catch(console.error);
  }

  #createClient() {
    this.#client.on("ready", this.#onReady);
    this.#client.on("messageCreate", this.#onMessageCreate);
    this.#client.on("voiceStateUpdate", this.#onVoiceStateUpdate);
  }
}

module.exports = { RoboScorp };
