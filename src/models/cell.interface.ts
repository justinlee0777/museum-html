import Position from './position.interface';

export default interface ICell {
  position: Position;

  top?: ICell;
  right?: ICell;
  bottom?: ICell;
  left?: ICell;

  hasPlayer?: true;
}
