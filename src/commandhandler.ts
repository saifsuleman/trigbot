import { channel } from "diagnostic_channel";
import { Message, User } from "discord.js";
import Bot from ".";
import Command from "./command";
import DefineCommand from "./commands/definecommand";
import FindWordCommand from "./commands/findwordcommand";
import TranslationsCommand from "./commands/translationscommand";

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
    this.registerCommand(new TranslationsCommand(this));
  }

  public registerCommand(command: Command) {
    this.commands[command.id] = command;
  }

  public getCommands(): Record<string, Command> {
    return this.commands;
  }

  public async onMessage(message: Message): Promise<void> {
    if (!message.content.startsWith(this.prefix)) return;

    interface IWhitelist {
      guild: string;
      channels: string[];
    }
    const whitelists: IWhitelist[] = [
      {
        guild: "599400943389376533",
        channels: [
          "599419848652488704",
          "599410789987778568",
          "599419761410965523",
          "600728137633890317",
        ],
      },
    ];

    const guildId = message.guild ? message.guild.id : undefined;
    const channelId = message.channel.id;

    if (guildId && channelId) {
      const whitelist = whitelists.find(
        (whitelist) => whitelist.guild === guildId
      );
      if (whitelist && !whitelist.channels.includes(channelId)) {
        return;
      }
    }

    const content: string = message.content.substring(this.prefix.length);
    if (!content.length) return;

    const arr = content.split(" ");
    if (!this.commands[arr[0]]) return;

    const command = this.commands[arr[0]];
    return command.exec(arr.slice(1, arr.length), message);
  }
}
