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
    this.on("message", async (m: Message) => {
      if (m.author.bot || m.author === this.user) return;

      try {
        await this.commandHandler.onMessage(m);
      } catch (e: any) {
        try {
          await m.channel.send(`:( ${e}`);
        } catch {}
      }
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
    let page: number = 0;

    const createCollector = async (message: Message) => {
      const filter = (r: MessageReaction) =>
        ["◀️", "▶️"].includes(r.emoji.name);
      const collector = message.createReactionCollector(filter, {
        dispose: true,
      });

      const callback = async (r: MessageReaction) => {
        if (r.emoji.name === "◀️") {
          page = Math.max(page - 1, 0);
        }
        if (r.emoji.name === "▶️") {
          page = Math.min(page + 1, words.length - 1);
        }
        await define(message);
      };
      collector.on("collect", callback);
      collector.on("remove", callback);
    };

    const define = async (previousMessage?: Message) => {
      const word = words[page];
      const embed = getEmbed(
        word,
        query,
        words.length > 1 ? `${page + 1} / ${words.length}` : undefined
      );
      const message = previousMessage
        ? await previousMessage.edit(embed)
        : await m.channel.send(embed);

      if (!previousMessage && words.length > 1) {
        await message.react("◀️");
        await message.react("▶️");
        await createCollector(message);
      }
    };

    words.length
      ? define()
      : await m.channel.send(":x: No matches found for that query.");
  }
}

dotenv.config();
const bot = new Bot();
bot.login(process.env["TOKEN"]);
