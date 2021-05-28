import { Message } from "discord.js";

export default interface Command {
  id: string;
  exec(args: string[], m: Message): Promise<void>;
}
