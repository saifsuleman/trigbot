export default interface Word {
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
