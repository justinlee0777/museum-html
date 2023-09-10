import Cells from '../models/cells.interface';
import Position from '../models/position.interface';

export default class RoomManipulator {
  static removeCell(cells: Cells, position: Position): void {
    const [x, y] = position;

    cells[y][x] = undefined;
  }
}
