import Position from './position.interface';

export default interface ICell {
  position: Position;

  objects?: Array<symbol>;
}
