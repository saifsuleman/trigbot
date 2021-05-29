import axios from "axios";
import discord, {
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
} from "discord.js";
import CommandHandler from "./commandhandler";
import { Word, getEmbed, TrigQuote } from "./word";
import dotenv from "dotenv";

export default class Bot extends discord.Client {
  private commandHandler: CommandHandler;

  private dictionary: Word[];
  private translations: TrigQuote[];

  public getDictionary(): Word[] {
    return this.dictionary;
  }

  public getTranslations(): TrigQuote[] {
    return this.translations;
  }

  constructor() {
    super();
    this.commandHandler = new CommandHandler(this, "+");

    this.dictionary = [];
    this.translations = [];

    this.fetchDictionary();
    this.fetchTranslations();

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

  private async fetchTranslations(): Promise<TrigQuote[]> {
    const res = await axios.get(
      "https://trigedasleng.net/api/legacy/translations"
    );
    this.translations = res.data as TrigQuote[];
    return this.translations;
  }

  public async defineWords(
    words: (Word | TrigQuote)[],
    m: Message,
    query: string
  ) {
    const define = async (i: number, previousMessage?: Message) => {
      const word = words[i];
      const embed = getEmbed(
        word,
        query,
        words.length > 1 ? `${i + 1} / ${words.length}` : undefined
      );
      const message = previousMessage
        ? await previousMessage.edit(embed)
        : await m.channel.send(embed);

      await message.react("◀️");
      await message.react("▶️");

      const filter = (r: MessageReaction) =>
        ["◀️", "▶️"].includes(r.emoji.name);
      const collector = message.createReactionCollector(filter);

      const callback = async (reaction: MessageReaction) => {
        collector.off("collect", callback);
        collector.off("remove", callback);

        if (reaction.emoji.name === "◀️") await define(i - 1, message);
        if (reaction.emoji.name === "▶️") await define(i + 1, message);
      };
      collector.on("collect", callback);
      collector.on("remove", callback);
    };

    words.length
      ? define(0)
      : await m.channel.send(":x: No matches found for that query.");
  }
}

dotenv.config();
const bot = new Bot();
bot.login(process.env["TOKEN"]);
