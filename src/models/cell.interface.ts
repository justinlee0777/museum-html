import Position from './position.interface';

export default interface ICell<CellData = void> {
  position: Position;

  objects?: Array<symbol>;

  data?: CellData;
}
