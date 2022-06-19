export interface IFormChapter {
  hr?: boolean;
  title?: string;
  render?: () => any;

  [key: string]: any;
}

export interface IFormChapterMap {
  [key: string]: IFormChapter;
}
