import { MessageEmbed } from "discord.js";

export interface Word {
  id: number;
  word: string;
  etymology: string;
  translation: string;
  link: string;
  citations: number;
  example: string;
  note: string;
  filter: string;
}

export interface TrigQuote {
  id: number;
  trigedasleng: string;
  translation: string;
  etymology: string;
  leipzig: string;
  episode: string;
  audio: string;
  speaker: string;
  source: string;
}

export function getColour(word: Word | TrigQuote) {
  if (isWord(word)) {
    switch (word.filter) {
      case "canon":
        return "#ad0000";
      case "noncanon":
        return "e36600";
    }

    return "#90c900";
  }

  return "#4287f5";
}

export function isWord(object: any): object is Word {
  const keys = ["word", "translation", "etymology"];
  return hasKeys(object, keys);
}

export function isQuote(object: any): object is TrigQuote {
  const keys = ["trigedasleng", "translation", "etymology"];
  return hasKeys(object, keys);
}

function hasKeys(object: any, keys: string[]): boolean {
  return object && keys.every((key: string) => key in object);
}

export function getEmbed(
  content: Word | TrigQuote,
  query: string,
  footer: string = ""
): MessageEmbed {
  if (isWord(content)) {
    const word = content as Word;
    const words = word.word.split(" ").length;
    let embed = new MessageEmbed()
      .setTitle(`Definition: '${query}'`)
      .setFooter(footer)
      .setColor(getColour(word))
      .addFields(
        { name: words > 1 ? "Phrase:" : "Word:", value: word.word },
        { name: "Translation:", value: word.translation },
        { name: "Etymology:", value: word.etymology }
      );
    return embed;
  }

  const quote = content as TrigQuote;
  let embed = new MessageEmbed()
    .setTitle(`Translation: '${query}'`)
    .setFooter(footer)
    .setColor(getColour(quote))
    .addFields(
      { name: "Trigedasleng:", value: quote.trigedasleng },
      { name: "Translation:", value: quote.translation },
      { name: "Episode:", value: quote.episode }
    );
  if (quote.speaker !== "")
    embed = embed.addFields({ name: "Speaker", value: quote.speaker });
  return embed;
}
