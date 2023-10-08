type Grid = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface FormItemLayout {
  grid: {
    xs?: Grid;
    sm?: Grid;
    md?: Grid;
    lg?: Grid;
    xl?: Grid;
  };
}

export { FormItemLayout };
