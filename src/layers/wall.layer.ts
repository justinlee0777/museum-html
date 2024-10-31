import Cell from '../models/cell.model';
import { MuseumWall, MuseumWallType } from '../models/museum-wall.model';
import { Position } from '../models/position.model';
import WallRegistry from '../models/registries/wall-registry.model';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface WallLayerArgs {
  cellSize: number;
}

interface WallPosition {
  position: Position;
  wallType: MuseumWallType;
}

export default class WallLayer {
  constructor(
    private registry: WallRegistry,
    private args: WallLayerArgs,
    private cells: Array<Array<Cell>>,
    private walls: Array<MuseumWall>
  ) {}

  draw(canvas: HTMLCanvasElement): void {
    const { cellSize } = this.args;
    const { cells, walls } = this;

    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;

    const wallPositions: Map<string, WallPosition> = new Map();

    for (const wall of walls) {
      let positions: Array<Position>, wallType: MuseumWallType;

      const [x, y] = wall.origin;
      if ('height' in wall) {
        positions = Array(wall.height)
          .fill(undefined)
          .map((_, i) => [x, y + i]);
        wallType = MuseumWallType.VERTICAL;
      } else {
        positions = Array(wall.width)
          .fill(undefined)
          .map((_, i) => [x + i, y]);
        wallType = MuseumWallType.HORIZONTAL;
      }

      for (const position of positions) {
        const wallKey = this.getWallKey(position);

        // We're going to assume the user will not pass the same wall under the same type. I'm not even
        // sure if that's mathematically possible unless you literally pass in the same dimensions twice.
        if (wallPositions.has(wallKey)) {
          wallPositions.set(wallKey, {
            position,
            wallType: MuseumWallType.INTERSECTING,
          });
        } else {
          wallPositions.set(wallKey, {
            position,
            wallType,
          });
        }
      }
    }

    for (const {
      position: [ox, oy],
      wallType,
    } of wallPositions.values()) {
      const drawSprite: DrawSprite = (image, sx, sy, sw, sh) => {
        context.drawImage(
          image,
          sx,
          sy,
          sw,
          sh,
          ox * cellSize,
          oy * cellSize,
          cellSize,
          cellSize
        );
      };

      this.registry.draw(drawSprite, { cell: cells[oy][ox], wallType });
    }
  }

  private getWallKey([x, y]: Position): string {
    return `${y}-${x}`;
  }
}
