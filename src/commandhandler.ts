import { Message, User } from "discord.js";
import Bot from ".";
import Command from "./command";
import DefineCommand from "./commands/definecommand";
import FindWordCommand from "./commands/findwordcommand";

export default class CommandHandler {
  bot: Bot;
  private commands: Record<string, Command>;
  private prefix: string;

  constructor(bot: Bot, prefix: string) {
    this.bot = bot;
    this.commands = {};
    this.prefix = prefix;

    this.registerCommand(new DefineCommand(this));
    this.registerCommand(new FindWordCommand(this));
  }

  public registerCommand(command: Command) {
    this.commands[command.id] = command;
  }

  public getCommands(): Record<string, Command> {
    return this.commands;
  }

  public async onMessage(message: Message): Promise<void> {
    if (!message.content.startsWith(this.prefix)) return;

    const content: string = message.content.substring(this.prefix.length);
    if (!content.length) return;

    const arr = content.split(" ");
    if (!this.commands[arr[0]]) return;

    const command = this.commands[arr[0]];
    return command.exec(arr.slice(1, arr.length), message);
  }
}
