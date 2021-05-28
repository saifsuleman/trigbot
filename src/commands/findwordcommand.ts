import discord, { Message } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import Word from "../word";

export default class FindWordCommand implements Command {
  id: string;
  commandHandler: CommandHandler;

  constructor(commandHandler: CommandHandler) {
    this.id = "findword";
    this.commandHandler = commandHandler;
  }

  async exec(args: string[], m: Message): Promise<void> {
    if (!args.length) {
      await m.channel.send("Usage: `+findword <word|phrase>");
      return;
    }

    const query = args.join(" ");
    const has: (text: string) => boolean = (text: string) => {
      const index = text.toLowerCase().indexOf(query.toLowerCase());
      if (index === -1) {
        return false;
      }

      if (index > 0 && text[index - 1].match(/[a-zA-Z]/)) {
        return false;
      }

      if (index + query.length < text.length) {
        if (text[index + query.length].match(/[a-zA-Z]/)) {
          return false;
        }
      }

      return true;
    };

    const words = this.commandHandler.bot
      .getDictionary()
      .filter(
        (word) => has(word.word) || has(word.translation) || has(word.etymology)
      );
    await this.commandHandler.bot.defineWords(words, m);
    console.log(words.length);
  }
}
