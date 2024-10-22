import Cell from '../models/cell.model';
import TileRegistry from '../models/registries/tile-registry.model';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface TileLayerArgs {
  cellSize: number;
}

export default class TileLayer {
  sprite: HTMLCanvasElement | undefined;

  constructor(
    private registry: TileRegistry,
    private args: TileLayerArgs,
    private cells: Array<Array<Cell>>
  ) {}

  draw(): void {
    const { cellSize } = this.args;
    const { cells } = this;

    const canvas = document.createElement('canvas');

    canvas.height = cells.length * cellSize;
    canvas.width = cells[0].length * cellSize;

    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;

    cells.forEach((row, j) => {
      row.forEach((cell, i) => {
        const drawSprite: DrawSprite = (image, sx, sy, sw, sh) => {
          context.drawImage(
            image,
            sx,
            sy,
            sw,
            sh,
            i * cellSize,
            j * cellSize,
            cellSize,
            cellSize
          );
        };

        this.registry.draw(drawSprite, { cell });
      });
    });

    this.sprite = canvas;
  }
}
