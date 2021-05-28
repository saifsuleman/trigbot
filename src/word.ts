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

function getColour(word: Word | TrigQuote) {
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

function isWord(object: any): object is Word {
  return "word" in object && "translation" in object && "etymology" in object;
}

export function getEmbed(
  content: Word | TrigQuote,
  query: string,
  footer: string = ""
): MessageEmbed {
  if (isWord(content)) {
    const word = content as Word;
    return new MessageEmbed()
      .setTitle(`Definition: ${query}`)
      .setFooter(footer)
      .setColor(getColour(word))
      .addFields(
        { name: "Word", value: word.word },
        { name: "Translation", value: word.translation },
        { name: "Etymology", value: word.etymology }
      );
  }

  const quote = content as TrigQuote;
  let embed = new MessageEmbed()
    .setTitle(`Translation: ${query}`)
    .setFooter(footer)
    .setColor(getColour(quote))
    .addFields(
      { name: "Trigedasleng", value: quote.trigedasleng },
      { name: "Translation", value: quote.translation },
      { name: "Episode", value: quote.episode }
    );
  if (quote.speaker !== "") {
    embed = embed.addFields({ name: "Speaker", value: quote.speaker });
  }
  return embed;
}
