import { Channel, Message, MessageEmbed, MessageReaction } from "discord.js";
import Command from "../command";
import CommandHandler from "../commandhandler";
import { shuffleArray } from "../utils";
import { getColour, isQuote, isWord, TrigQuote, Word } from "../word";

export default class FlashcardsCommand implements Command {
  id: string;
  commandHandler: CommandHandler;

  constructor(commandHandler: CommandHandler) {
    this.id = "flashcards";
    this.commandHandler = commandHandler;
  }

  async exec(args: string[], m: Message): Promise<void> {
    if (args.length === 0) return this.sendUsageMessage(m);

    const mode = args[0].toLowerCase();
    let stack: (Word | TrigQuote)[] = [];
    switch (mode) {
      case "definitions":
        stack = this.commandHandler.bot.getDictionary();
        break;
      case "translations":
        stack = this.commandHandler.bot.getTranslations();
        break;
      case "mixed":
        const bot = this.commandHandler.bot;
        const dictionary = bot.getDictionary();
        const translations = bot.getTranslations();
        stack = stack.concat(dictionary).concat(translations);
        break;
      default:
        return this.sendUsageMessage(m);
    }
    stack = shuffleArray(stack);

    let message: Message | undefined;
    let count = 0;
    const getEmbed = async () => {
      let embed = new MessageEmbed()
        .setTitle("Trigedasleng Flashcards")
        .setFooter(`${count + 1} / ${stack.length}`);
      const trig = stack[count];
      if (isWord(trig)) {
        embed = embed.addFields(
          { name: "Trigedasleng", value: trig.word },
          { name: "English", value: `||${trig.translation}||` }
        );
      }
      if (isQuote(trig)) {
        embed = embed.addFields(
          { name: "Trigedasleng", value: trig.trigedasleng },
          { name: "English", value: `||${trig.translation}||` }
        );
      }
      return embed.setColor(getColour(trig));
    };

    const send = async () => {
      const embed = await getEmbed();
      if (message) {
        message = await message.edit(embed);
      } else {
        message = await m.channel.send(embed);

        await message.react("◀️");
        await message.react("▶️");

        const filter = (r: MessageReaction) =>
          ["◀️", "▶️"].includes(r.emoji.name);
        const collector = message.createReactionCollector(filter, {
          dispose: true,
        });
        const callback = async (r: MessageReaction) => {
          if (r.emoji.name === "◀️") count = Math.max(0, count - 1);
          if (r.emoji.name === "▶️")
            count = Math.min(count + 1, stack.length - 1);
          return send();
        };

        collector.on("collect", callback);
        collector.on("remove", callback);
      }
    };

    await send();
  }

  async sendUsageMessage(m: Message): Promise<void> {
    await m.channel.send(
      "Usage: `+flashcards <definitions|translations|mixed>`"
    );
  }
}
