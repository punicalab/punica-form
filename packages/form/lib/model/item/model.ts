export type Grid = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ErrorDetail = {
  error: boolean;
  errorMessages?: Array<string>;

  [key: string]: any;
};
