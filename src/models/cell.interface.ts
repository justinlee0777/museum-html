import Position from './position.interface';

export default interface ICell<CellData = void> {
  position: Position;

  data?: CellData;
}
