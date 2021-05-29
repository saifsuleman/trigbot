import { Message } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import { has } from "../utils";
import { TrigQuote, Word } from "../word";

export default class FindWordCommand implements Command {
  id: string;
  commandHandler: CommandHandler;

  constructor(commandHandler: CommandHandler) {
    this.id = "find";
    this.commandHandler = commandHandler;
  }

  async exec(args: string[], m: Message): Promise<void> {
    if (!args.length) {
      await m.channel.send("Usage: `+findword <word|phrase>");
      return;
    }

    const query = args.join(" ");
    const wordFilter = (word: Word) =>
      has(query, word.word) || has(query, word.translation);
    const words: (TrigQuote | Word)[] = this.commandHandler.bot
      .getDictionary()
      .filter(wordFilter);

    const quoteFilter = (quote: TrigQuote) =>
      has(query, quote.translation) || has(query, quote.trigedasleng);
    const quotes: (TrigQuote | Word)[] = this.commandHandler.bot
      .getTranslations()
      .filter(quoteFilter);

    await this.commandHandler.bot.defineWords(
      words.concat(quotes),
      m,
      args.join(" ")
    );
  }
}
