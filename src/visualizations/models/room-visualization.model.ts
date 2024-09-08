import RoomData from '../../data/room.data';
import NavigationInteractive from '../../interactive/navigation.interactive';
import Camera from '../../models/camera.interface';
import ICell from '../../models/cell.interface';
import Position from '../../models/position.interface';

export default interface RoomVisualization<DrawResult, CellData = void> {
  draw(data: RoomData<CellData>, origin: Position, camera: Camera): DrawResult;

  drawCell(cell: ICell<CellData>): DrawResult;

  drawBlank(position: Position): DrawResult;

  addNavigation(interactive: NavigationInteractive): void;

  destroy(): void;
}
