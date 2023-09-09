import RoomData from '../../data/room.data';
import NavigationInteractive from '../../interactive/navigation.interactive';
import ICell from '../../models/cell.interface';
import Position from '../../models/position.interface';

export default interface RoomVisualization<DrawResult> {
  draw(data: RoomData, origin: Position): DrawResult;

  drawCell(cell: ICell): DrawResult;

  addNavigation(interactive: NavigationInteractive): void;
}
