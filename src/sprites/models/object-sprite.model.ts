import Cell from '../../models/cell.model';
import { Position } from '../../models/position.model';

export default abstract class ObjectSprite {
  sprite: HTMLCanvasElement | undefined;

  abstract draw(cell: Cell, objectOrigin: Position): void;
}
