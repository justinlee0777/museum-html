import Cell from '../models/cell.model';
import MuseumObject from '../models/museum-object.model';
import LongPaintingSprite from '../sprites/long-painting';
import DrawSprite from '../sprites/models/draw-sprite.model';

interface ObjectLayerArgs {
  cellSize: number;
}

export default class ObjectLayer {
  sprite: HTMLCanvasElement | undefined;

  constructor(
    private args: ObjectLayerArgs,
    private cells: Array<Array<Cell>>,
    private objects: Array<MuseumObject>
  ) {}

  draw(): void {
    const { cells } = this;
    const { cellSize } = this.args;

    const canvas = document.createElement('canvas');

    canvas.height = cells.length * cellSize;
    canvas.width = cells[0].length * cellSize;

    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;

    for (const {
      origin: [ox, oy],
      width,
    } of this.objects) {
      const drawSprite: DrawSprite = (
        image,
        sx,
        sy,
        sw,
        sh,
        offsetX = 0,
        offsetY = 0
      ) => {
        context.drawImage(
          image,
          sx,
          sy,
          sw,
          sh,
          (ox + offsetX) * cellSize,
          (oy + offsetY) * cellSize,
          cellSize,
          cellSize
        );
      };

      LongPaintingSprite.draw(drawSprite, { width });
    }

    this.sprite = canvas;
  }
}
