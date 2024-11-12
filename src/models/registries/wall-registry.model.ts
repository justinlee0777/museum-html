import DrawSprite from '../../sprites/models/draw-sprite.model';
import Cell from '../cell.model';
import { MuseumWallType } from '../museum-wall.model';

interface WallArgs {
  cell: Cell;
  wallType: MuseumWallType;
}

export default interface WallRegistry {
  draw(drawSprite: DrawSprite, args: WallArgs): Promise<void>;
}
