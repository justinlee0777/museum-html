import Direction from './direction.enum';

export default interface ICell {
  id: number;

  objects?: Array<Symbol>;

  [Direction.TOP]?: ICell;
  [Direction.RIGHT]?: ICell;
  [Direction.BOTTOM]?: ICell;
  [Direction.LEFT]?: ICell;
}
