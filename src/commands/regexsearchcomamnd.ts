import { Message } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import { getTrigPair, TrigQuote, Word } from "../word";

/**
 * syntax: +regexsearch <definitions|translations|all> <regex>
 */
export default class RegexSearchCommand implements Command {
  id: string;
  commandHandler: CommandHandler;

  constructor(commandHandler: CommandHandler) {
    this.id = "regexsearch";
    this.commandHandler = commandHandler;
  }

  async exec(args: string[], m: Message): Promise<void> {
    if (args.length < 2) {
      await m.channel.send(
        "Usage: `+regexsearch <definitions|translations|all> <regex query>`"
      );
      return;
    }

    let source: (Word | TrigQuote)[] = [];
    switch (args[0].toLowerCase()) {
      case "definitions":
        source = this.commandHandler.bot.getDictionary();
        break;
      case "translations":
        source = this.commandHandler.bot.getTranslations();
        break;
      case "all":
        const bot = this.commandHandler.bot;
        const dictionary = bot.getDictionary();
        const translations = bot.getTranslations();
        source = source.concat(dictionary).concat(translations);
        break;
      default:
        await m.channel.send(
          "Usage: `+regexsearch <definitions|translations|all> <regex query>`"
        );
        return;
    }

    const expr: string = args.slice(1, args.length).join(" ");
    try {
      const regex = new RegExp(expr);
      const words = source.filter((x: Word | TrigQuote) => {
        const pair = getTrigPair(x);
        return regex.test(pair.english) || regex.test(pair.trig);
      });
      await this.commandHandler.bot.defineWords(words, m, expr);
    } catch {
      await m.channel.send(`Invalid regular expression: \`${expr}\``);
      return;
    }
  }
}
