import Cell from '../models/cell.model';
import TileRegistry from '../models/registries/tile-registry.model';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface TileLayerArgs {
  cellSize: number;
}

export default class TileLayer {
  constructor(
    private registry: TileRegistry,
    private args: TileLayerArgs,
    private cells: Array<Array<Cell>>
  ) {}

  async draw(canvas: HTMLCanvasElement): Promise<void> {
    const { cellSize } = this.args;
    const { cells } = this;

    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;

    const drawOperations: Array<Promise<void>> = [];

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

        drawOperations.push(this.registry.draw(drawSprite, { cell }));
      });
    });

    await Promise.all(drawOperations);
  }
}
