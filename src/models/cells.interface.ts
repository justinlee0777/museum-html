import ICell from './cell.interface';
import Position from './position.interface';

export default interface Cells extends Array<Array<ICell | undefined>> {
  beginning: Position;
}
