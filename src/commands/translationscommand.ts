import { Message } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import { has } from "../utils";
import { TrigQuote } from "../word";

export default class TranslationsCommand implements Command {
  id: string;
  commandHandler: CommandHandler;

  constructor(commandHandler: CommandHandler) {
    this.id = "translations";
    this.commandHandler = commandHandler;
  }

  async exec(args: string[], m: Message): Promise<void> {
    if (!args.length) {
      await m.channel.send("Usage: `+translations <word|phrase>");
      return;
    }

    const query = args.join(" ");
    const filter = (quote: TrigQuote) =>
      has(query, quote.translation) || has(query, quote.trigedasleng);
    const quotes: TrigQuote[] = this.commandHandler.bot
      .getTranslations()
      .filter(filter);
    await this.commandHandler.bot.defineWords(quotes, m, args.join(" "));
  }
}
