import { Message } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import { has } from "../utils";

export default class DefineCommand implements Command {
  id: string;
  commandHandler: CommandHandler;

  constructor(commandHandler: CommandHandler) {
    this.id = "define";
    this.commandHandler = commandHandler;
  }

  async exec(args: string[], m: Message): Promise<void> {
    if (!args.length) {
      await m.channel.send("Usage: `+define <word|phrase>");
      return;
    }

    const query = args.join(" ");
    const words = this.commandHandler.bot
      .getDictionary()
      .filter((word) => has(query, word.word));
    await this.commandHandler.bot.defineWords(words, m, args.join(" "));
  }
}
