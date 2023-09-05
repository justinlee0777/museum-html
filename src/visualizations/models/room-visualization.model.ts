import RoomData from '../../data/room.data';
import ICell from '../../models/cell.interface';
import Position from '../../models/position.interface';

export default interface RoomVisualization<DrawResult> {
  draw(data: RoomData, origin: Position): DrawResult;

  drawCell(cell: ICell): DrawResult;
}
