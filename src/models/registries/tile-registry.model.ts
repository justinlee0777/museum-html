import DrawSprite from '../../sprites/models/draw-sprite.model';
import Cell from '../cell.model';

interface TileArgs {
  cell: Cell;
}

export default interface TileRegistry {
  draw(drawSprite: DrawSprite, args: TileArgs): void;
}
