import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import Word from "../word";

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
      .filter((word) => word.word.toLowerCase() === query.toLowerCase());
    await this.commandHandler.bot.defineWords(words, m);
  }
}
