import axios from "axios";
import discord, { Message, MessageEmbed, MessageReaction } from "discord.js";
import CommandHandler from "./commandhandler";
import Word from "./word";

export default class Bot extends discord.Client {
  private commandHandler: CommandHandler;
  private dictionary: Word[];

  public getDictionary(): Word[] {
    return this.dictionary;
  }

  constructor() {
    super();
    this.commandHandler = new CommandHandler(this, "+");
    this.dictionary = [];
    this.fetchDictionary();

    this.on("ready", () => {
      if (this.user) console.log(`Connected as: ${this.user.tag}`);
    });
    this.on("message", (m: Message) => {
      if (m.author.bot || m.author === this.user) return;
      this.commandHandler.onMessage(m);
    });
  }

  private async fetchDictionary(): Promise<Word[]> {
    const res = await axios.get(
      "https://trigedasleng.net/api/legacy/dictionary"
    );
    this.dictionary = res.data as Word[];
    return this.dictionary;
  }

  public async defineWords(words: Word[], m: Message) {
    const getColour = (word: Word) => {
      switch (word.filter) {
        case "canon":
          return "#ad0000";
        case "noncanon":
          return "e36600";
      }

      return "#90c900";
    };

    const define = async (i: number) => {
      const word = words[i];
      let embed = new MessageEmbed()
        .setTitle(word.word)
        .setFooter(`[${i + 1} / ${words.length}]`)
        .setColor(getColour(word))
        .addFields(
          { name: "Word", value: word.word },
          { name: "Translation", value: word.translation },
          { name: "Etymology", value: word.etymology }
        );
      const message = await m.channel.send(embed);

      if (i > 0) {
        await message.react("◀️");
        const filter = (r: MessageReaction) => r.emoji.name === "◀️";
        const collector = message.createReactionCollector(filter);
        collector.on("collect", async () => {
          await message.delete();
          await define(i - 1);
        });
      }

      if (i + 1 < words.length) {
        await message.react("▶️");
        const filter = (r: MessageReaction) => r.emoji.name === "▶️";
        const collector = message.createReactionCollector(filter);
        collector.on("collect", async () => {
          await message.delete();
          await define(i + 1);
        });
      }
    };

    words.length
      ? define(0)
      : await m.channel.send(":x: No matches found for that query.");
  }
}

const bot = new Bot();
bot.login(process.env["TOKEN"]);
